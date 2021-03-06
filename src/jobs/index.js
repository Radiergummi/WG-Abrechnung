'use strict';

/*
 global module,
 require
 */

(function(module) {
  const Agenda   = require('agenda'),
        colors   = require('colors'),
        nconf    = require('nconf'),
        winston  = require('winston'),

        Database = require('../database.new');

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
  module.initialize = function(callback) {
    callback = callback || function() {
      };

    try {

      // try to connect to the jobs collection
      this.db = Database.nativeClient;
    }
    catch (error) {
      winston.error('[jobs]'.red + ' Could not retrieve mongoose collection "jobs":');
      winston.error(error);
      return false;
    }

    // ensure indexes on the database collection
    this.db.collection('jobs').ensureIndex({
      nextRunAt: 1,
      lockedAt:  1,
      name:      1,
      priority:  1
    }, function() {
    });

    // create a new instance
    this.instance = new Agenda({
      processEvery: '2 seconds'
    }).mongo(this.db, 'jobs');

    this.instance.on('error', this.databaseConnectionError);
    this.instance.on('ready', this.start.bind(this, callback));
  };

  /**
   * start agenda after registering all jobs on the instance
   *
   * @param callback
   * @returns {*}
   */
  module.start = function(callback) {
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
   * Error handler for logging database connection failures
   *
   * @param {Error} [error]  an optional error object
   */
  module.databaseConnectionError = function(error) {
    winston.error('[jobs]'.red + ' Error connecting to database', error);
  };

  /**
   * loads all available job modules
   *
   * @param {object} agenda  the agenda instance
   */
  module.registerJobs = function(agenda) {

    // iterate over all available modules
    for (let i = 0; i < this.jobs.length; i++) {

      // require the module from the current directory, give it an agenda instance as an argument
      require('./' + this.jobs[ i ])(agenda);
    }
  };
})(exports);
