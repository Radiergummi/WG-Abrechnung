'use strict';

/*
 global module,
 require
 */

module.exports = function(agenda) {
  agenda.define('generate yearly statistics', function(job, done) {
  });

  agenda.define('generate monthly statistics', function(job, done) {
    // etc etc
    //console.log(new Date().toLocaleTimeString() + ': agenda task should be run every 5 seconds.');
    done();
  });

  agenda.every('5 seconds', 'generate monthly statistics');
};
