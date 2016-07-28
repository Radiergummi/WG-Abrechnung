'use strict';

/*
 global module,
 require
 */

var colors  = require('colors'),
    winston = require('winston'),

    mailer  = require('../mailer'),
    Invoice = require('../invoice');

module.exports = function(agenda) {
  agenda.define('monthly spending calculation', function(job, done) {
    winston.info('Calculating spendings');

    var now = new Date();
    Invoice.getByMonth(new Date(now.setMonth(now.getMonth() - 1)), function(error, data) {
      if (error) {
        winston.error('[jobs/spending]'.red + ' Could not retrieve invoices. Aborting spending calculation. %s', error.message);
      }

      
    });
  });

  // run the spending calculations at 00:00 every first day of the month
  agenda.every('0 0 1 * *', 'monthly spending calculation');
};
