'use strict';

/*
 global module,
 require
 */

/**
 * Returns a mongo database handle
 */
(function (module) {
  var colors = require('colors'),
      mongoose = require('mongoose'),
      mongoAdmin  = mongoose.mongo.Admin,
      mongoStore = require('connect-mongo'),
      winston = require('winston'),
      nconf = require('nconf');

  /**
   * initializes the database
   *
   * @param {function} callback  a callback to execute once the db is connected
   * @returns {exports}
   */
  module.initialize = function (callback) {
    callback = callback || function () {
      };

    var connOptions = {
      auth: {
        authdb: "admin"
      }
    };

    var connString = this.buildConnectionString();

    // Connect to mongo db
    mongoose.connect(connString, connOptions);
    winston.info('[database]'.white + ' Database connection established.');

    return this;
  };

  module.sessionStore = function(session) {
    var mongo = mongoStore(session);

    try {
      return new mongo({
        mongooseConnection: mongoose.connection,
        stringify: false
      });
    }
    catch (error) {
      winston.error('[database]'.white + ' Could not reuse mongoose connection as session storage. Is the connection initialized?');
      winston.error('[database]'.white + ' %s', error.message);
    }
  };

  module.collection = function(name) {
    try {
      return mongoose.connection.collection(name);
    } catch (error) {
      winston.error('[database]'.white + ' Could not retrieve mongoose collection %s', name);
      winston.error('[database]'.white + ' %s', error.message);
    }
  };


  module.connection = function() {return mongoose.connection.db};

  module.status = function(callback) {
    new mongoAdmin(this.connection()).serverStatus(function(error, data) {
      if (error) {
        return callback(error);
      }

      return callback(null, data);
    });
  };

  module.buildConnectionString = function () {
    // optionally use authentication
    var usernamePassword = '';
    if (nconf.get('database:username') && nconf.get('database:password')) {
      usernamePassword = nconf.get('database:username') + ':' + encodeURIComponent(nconf.get('database:password')) + '@';
    }

    // Sensible defaults for Mongo, if not set
    if (! nconf.get('database:host')) {
      nconf.set('database:host', '127.0.0.1');
    }
    if (! nconf.get('database:port')) {
      nconf.set('database:port', 27017);
    }
    if (! nconf.get('database:name')) {
      nconf.set('database:name', '0');
    }

    // grab database host(s)
    var hosts = nconf.get('database:host').split(',');

    // grab database port(s)
    var ports = nconf.get('database:port').toString().split(',');
    var servers = [];

    for (var i = 0; i < hosts.length; i ++) {
      servers.push(hosts[ i ] + ':' + ports[ i ]);
    }

    // build connection string
    return 'mongodb://' + usernamePassword + servers.join() + '/' + nconf.get('database:name');
  }
}(exports));
