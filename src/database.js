'use strict';

/*
 global module,
 require
 */

const colors     = require('colors'),
      mongoose   = require('mongoose'),
      mongoAdmin = mongoose.mongo.Admin,
      mongoStore = require('connect-mongo'),
      winston    = require('winston'),
      nconf      = require('nconf');
/**
 * Returns a mongo database handle
 */
(function(module) {

  /**
   * initializes the database connection
   *
   * @param {function} [callback]  a callback to execute once the db is connected
   * @returns {exports}
   */
  module.initialize = function(callback) {
    callback = callback || function() {
      };

    let connOptions = {
          auth: {
            authdb: "admin"
          }
        },
        connString  = this.buildConnectionString();

    /**
     * use the native promise for mongoose
     *
     * @see https://github.com/Automattic/mongoose/issues/4291#issuecomment-230312093
     * @type {Promise}
     */
    mongoose.Promise = global.Promise;

    // Connect to mongo db
    mongoose.connect(connString, connOptions);
    winston.info('[database]'.white + ' Database connection established.');

    return this;
  };

  /**
   * creates a mongo session storage for express
   *
   * @param   {object} session
   * @returns {*}
   */
  module.sessionStore = function(session) {
    const mongo = mongoStore(session);

    try {
      return new mongo({
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
  module.collection = function(name) {
    try {
      return mongoose.connection.collection(name);
    } catch (error) {
      winston.error('[database]'.white + ' Could not retrieve mongoose collection %s', name);
      winston.error('[database]'.white + ' %s', error.message);
    }
  };

  /**
   * retrieves the current database connection
   *
   * @returns {*}
   */
  module.connection = function() {
    return mongoose.connection.db;
  };

  /**
   * retrieves the native connection client
   *
   * @returns {exports.connection|*|net.Socket|null}
   */
  module.nativeClient = function() {
    return mongoose.connection;
  };

  /**
   * retrieves the current database status
   *
   * @param {function} callback
   */
  module.status = function(callback) {
    new mongoAdmin(this.connection()).serverStatus(function(error, data) {
      if (error) {
        return callback(error);
      }

      return callback(null, data);
    });
  };

  /**
   * creates a connection string for mongo
   *
   * @returns {string}
   */
  module.buildConnectionString = function() {

    // optionally use authentication
    let usernamePassword = '';

    if (nconf.get('database:username') && nconf.get('database:password')) {
      usernamePassword = nconf.get('database:username') + ':' + encodeURIComponent(nconf.get('database:password')) + '@';
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
    return 'mongodb://' + usernamePassword + servers.join() + '/' + nconf.get('database:name');
  }
}(exports));
