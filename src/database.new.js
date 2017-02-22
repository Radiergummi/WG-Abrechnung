'use strict';

/*
 global module,
 require
 */

const mongoose   = require('mongoose'),
      mongoAdmin = mongoose.mongo.Admin,
      mongoStore = require('connect-mongo'),
      nconf      = require('nconf'),
      winston    = require('winston');

require('colors');

/**
 * reference to the current instance
 *
 * @type {null|Database}
 */
let instance = null;

/**
 * creates a new database connection
 */
class Database {

  /**
   * initializes the database connection
   *
   * @param {function} [callback]  a callback to execute once the db is connected
   */
  constructor (callback) {
    if (!instance) {
      instance = this.init(callback);
    }

    return instance;
  }

  /**
   * initializes the database connection
   *
   * @param   {function} [callback]  a callback to execute once the db is connected
   * @returns {Database}
   */
  static init (callback) {
    callback = callback || function() {
      };

    let connectionString  = Database.buildConnectionString(),
        connectionOptions = {
          auth: {
            authdb: "admin"
          }
        };

    /**
     * use the native promise for mongoose
     *
     * @see https://github.com/Automattic/mongoose/issues/4291#issuecomment-230312093
     * @type {Promise}
     */
    mongoose.Promise = global.Promise;

    // Connect to mongo db
    mongoose.connect(connectionString, connectionOptions);
    winston.info('[database]'.white + ' Database connection established.');

    callback(this);

    return this;
  }

  static get connection () {
    return mongoose.connection.db;
  }

  /**
   * retrieves the native connection client
   *
   * @returns {exports.connection|*|net.Socket|null}
   */
  static get nativeClient () {
    return mongoose.connection;
  };

  /**
   * creates a mongo session storage for express
   *
   * @param   {object} session
   * @returns {*}
   */
  static sessionStore (session) {
    const sessionStore = mongoStore(session);

    try {
      return new sessionStore({
        mongooseConnection: mongoose.connection,
        stringify:          false
      });
    }

    catch (error) {
      winston.error('[database]'.white + ' Could not reuse mongoose connection as session storage. Is the connection initialized?');
      winston.error('[database]'.white + ' %s', error.message);
    }
  };

  /**
   * retrieves a certain collection
   *
   * @param   {string} name the collection name
   * @returns {*}
   */
  static collection (name) {
    try {
      return mongoose.connection.collection(name);
    }

    catch (error) {
      winston.error('[database]'.white + ' Could not retrieve mongoose collection %s', name);
      winston.error('[database]'.white + ' %s', error.message);
    }
  };

  /**
   * retrieves the current database status
   *
   * @param {function} callback
   */
  static status (callback) {
    new mongoAdmin(Database.connection).serverStatus(function(error, data) {
      if (error) {
        return callback(error);
      }

      return callback(null, data);
    });
  };

  /**
   * creates a connection string for mongo
   *
   * @static
   * @returns {string}
   */
  static buildConnectionString () {

    // optionally use authentication
    let authenticationDetails = '';

    if (
      nconf.get('database:username') &&
      nconf.get('database:password')
    ) {
      let username = nconf.get('database:username'),
          password = nconf.get('database:password');

      authenticationDetails = `${username}:${encodeURIComponent(password)}@`;
    }

    // Sensible defaults for Mongo, if not set
    if (!nconf.get('database:host')) {
      nconf.set('database:host', '127.0.0.1');
    }

    if (!nconf.get('database:port')) {
      nconf.set('database:port', 27017);
    }

    if (!nconf.get('database:name')) {
      nconf.set('database:name', '0');
    }

    // grab database host(s)
    let hosts   = nconf.get('database:host').split(','),

        // grab database port(s)
        ports   = nconf.get('database:port').toString().split(','),
        servers = [];

    for (let i = 0; i < hosts.length; i++) {
      servers.push(hosts[ i ] + ':' + ports[ i ]);
    }

    // build connection string
    return `mongodb://${authenticationDetails}${servers.join()}/${nconf.get('database:name')}`;
  }
}

module.exports = Database;
