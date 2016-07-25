'use strict';

/*
 global module,
 require
 */

(function (module) {
  var Agenda  = require('agenda'),
      colors  = require('colors'),
      nconf   = require('nconf'),
      winston = require('winston'),

      db      = require('../database');

  /**
   * list of names of job modules to load
   *
   * @type {string[]}
   */
  module.jobs = [
    'spending',
    'statistics'
  ];

  /**
   * creates a database connection for agenda and loads up all jobs
   *
   * @param   {function} [callback]  an optional callback to execute once agenda is ready
   * @returns {boolean}
   */
  module.initialize = function (callback) {
    callback = callback || function () {
      };

    try {

      // try to connect to the jobs collection
      this.db = db.collection('jobs').conn.db;
    }
    catch (error) {
      winston.error('[jobs]'.red + ' Could not retrieve mongoose collection "jobs":');
      winston.error(error);
      return false;
    }

    // ensure indexes on the database collection
    this.db.ensureIndex({
      nextRunAt: 1,
      lockedAt:  1,
      name:      1,
      priority:  1
    }, function () {
    });

    // create a new instance
    this.instance = new Agenda().mongo(this.db, 'jobs', this.databaseConnectionError);
    this.instance.on('error', this.databaseConnectionError);
    this.instance.on('ready', this.start.bind(this, callback));

    console.log('initialized', this.instance.jobs({}, function(e, d) {console.log(arguments)}))
  };

  /**
   * start agenda after registering all jobs on the instance
   *
   * @param callback
   * @returns {*}
   */
  module.start = function (callback) {
    console.log('started')
    winston.info('[jobs]'.white + ' Agenda has been initialized');

    // register all Agenda jobs
    this.registerJobs(this.instance);

    // start the job runner
    this.instance.start();

    winston.info('[jobs]'.white + ' Successfully started agenda jobs.');

    // run the callback, supplement the jobs module as an argument
    return callback(this);
  };

  /**
   * Error handler for logging indexing failures
   *
   * @param {Error} error
   */
  module.logIndexError = function (error) {
    winston.warn('[jobs]'.white + ' Error ensuring indexes', error);
  };

  /**
   * Error handler for logging database connection failures
   *
   * @param {Error} error
   */
  module.databaseConnectionError = function () {
    winston.error('[jobs]'.red + ' Error connecting to database');
  };

  /**
   * loads all available job modules
   *
   * @param {object} agenda  the agenda instance
   */
  module.registerJobs = function (agenda) {

    // iterate over all available modules
    for (var i = 0; i < this.jobs.length; i ++) {

      // require the module from the current directory, give it an agenda instance as an argument
      require('./' + this.jobs[ i ])(agenda);
    }
  };
})(exports);
