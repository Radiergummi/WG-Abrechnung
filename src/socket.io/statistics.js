'use strict';

/*
 global module,
 require
 */

var debug  = require('debug')('flatm8:sockets:statistics'),
    moment = require('moment');

var Invoice = require('../invoice'),
    User    = require('../user');

var statisticsSockets = module.exports = {};

statisticsSockets.getInvoiceSumByUser = function(socket, id, callback) {
  return Invoice.getSums(id, function(error, data) {
    if (error) {
      return callback(error);
    }

    return callback(null, data);
  });
};

statisticsSockets.getOwnInvoiceSum = function(socket, callback) {
  return Invoice.getSums(socket._id, function(error, data) {
    if (error) {
      return callback(error);
    }

    return callback(null, data);
  });
};


statisticsSockets.getInvoiceStatistics = function(socket, callback) {
  new Promise(function(resolve, reject) {
    User.getAll(function(error, data) {
      if (error) {
        return reject(error);
      }

      var dataSets = {};

      data.forEach(function(user) {
        var userColor = JSON.parse(JSON.stringify(user.color));

        dataSets[ user._id ] = {
          label:                 user.firstName + ' ' + user.lastName,
          data:                  [],
          backgroundColor:       userColor.replace(/, 1\)$/, ', .2)'),
          borderColor:           userColor,
          pointBackgroundColor:  userColor,
          pointBorderColor:      userColor.replace(/, 1\)$/, ', .75)'),
          pointHoverBorderColor: userColor,
          spanGaps:              true,
          afterLabel:            function(tooltipItem, data) {
            console.log(tooltipItem);
            console.log(data);
          }
        };
      });

      return resolve(dataSets);
    });
  }).then(function(dataSets) {
    Invoice.getAll(function(error, invoices) {
      if (error) {
        throw error;
      }

      var dates = {};

      for (var i = 0; i < invoices.length; i++) {
        var date = invoices[ i ].creationDate;

        if (!dates.hasOwnProperty(date)) {
          dates[ date ] = [];
        }

        dates[ date ].push(invoices[ i ]);
      }

      var labels = [];

      // iterate over all dates
      for (var date in dates) {

        // push the current date into the labels array
        labels.push(moment(new Date(date)).format('Do MMMM YYYY'));

        // push null into each users data object for the current date
        for (var user in dataSets) {
          dataSets[ user ].data.push(null);
        }

        // iterate over all invoices in the current date
        for (var j = 0; j < dates[ date ].length; j++) {
          var currentInvoice = dates[ date ][ j ],
              currentDataSet = dataSets[ currentInvoice.user._id ];

          // replace the null value inserted above with the current sum
          currentDataSet.data[ currentDataSet.data.length - 1 ] = currentInvoice.sum;
        }
      }

      var statisticData = [];

      for (var user in dataSets) {
        statisticData.push(dataSets[ user ]);
      }

      return callback(null, {
        labels:   labels,
        datasets: statisticData
      });
    });
  });
};


statisticsSockets.getSpendingStatisticsByMonth = function(socket, month, callback) {
  month = new Date(month);

  debug('Called spending statistics by month: %s', month.toLocaleDateString());
  new Promise(function(resolve, reject) {
    User.getAll(function(error, data) {
      if (error) {
        return reject(error);
      }

      debug('found %s users', data.length);

      var dataSets = {};

      data.forEach(function(user) {
        var userColor = JSON.parse(JSON.stringify(user.color));

        dataSets[ user._id ] = {
          label:                 user.firstName + ' ' + user.lastName,
          data:                  [],
          backgroundColor:       userColor.replace(/, 1\)$/, ', .2)'),
          borderColor:           userColor,
          pointBackgroundColor:  userColor,
          pointBorderColor:      userColor.replace(/, 1\)$/, ', .75)'),
          pointHoverBorderColor: userColor,
          spanGaps:              true
        };
      });

      return resolve(dataSets);
    });
  }).then(function(dataSets) {

    /**
     * Create a date array for a month
     */
    var days = [];

    /**
     * retrieve all days of the selected month
     */
    for (
      var dateIterator = new Date(month.getFullYear(), month.getMonth(), 1);
      dateIterator <= new Date(month.getFullYear(), month.getMonth() + 1, 0);
      dateIterator.setDate(dateIterator.getDate() + 1)
    ) {

      // push the formatted date into the array
      days.push(moment(new Date(dateIterator)).format('Do MMMM YYYY'));
    }

    // foreach dataset, fill the data point array with null for each month day
    for (var set in dataSets) {
      dataSets[ set ].data = Array.apply(null, new Array(days.length)).map(function() {
        return null;
      });

      debug('modified user data for user %s (%s data points)', dataSets[ set ].label, dataSets[ set ].data.length);
    }

    return {
      dataSets: dataSets,
      days:     days
    };
  }).then(function(results) {
    var dataSets  = results.dataSets,
        monthDays = results.days,
        labels    = monthDays;

    /**
     * retrieve all invoices of a month, sorted by date
     */
    Invoice.getDateRangeByDate(
      new Date(month.getFullYear(), month.getMonth(), 1),
      new Date(month.getFullYear(), month.getMonth() + 1, 0),
      function(error, datesWithInvoices) {
        if (error) {
          throw error;
        }

        // iterate over all days of the month
        for (var i = 0; i < monthDays.length; i++) {

          // whether the current day is a day invoices were generated at
          if (datesWithInvoices.hasOwnProperty(monthDays[ i ])) {
            debug('At %s, %s invoice(s) have been generated.', monthDays[ i ], datesWithInvoices[ monthDays[ i ] ].length);

            // iterate over all invoices in the current day
            for (var j = 0; j < datesWithInvoices[ monthDays[ i ] ].length; j++) {
              var sum = (isNaN(datesWithInvoices[ monthDays[ i ] ][ j ].sum)
                  ? 0
                  : datesWithInvoices[ monthDays[ i ] ][ j ].sum
              );

              debug("data point value: %s\tnew value: %s", dataSets[ datesWithInvoices[ monthDays[ i ] ][ j ].user._id ].data[ i ], sum);

              // set the current day's data point to the invoice sum. since we filled the user data
              dataSets[ datesWithInvoices[ monthDays[ i ] ][ j ].user._id ].data[ i ] = dataSets[ datesWithInvoices[ monthDays[ i ] ][ j ].user._id ].data[ i ] + sum;
            }
          } else {
            debug('At %s, no invoices have been generated.', monthDays[ i ]);
          }
        }

        var statisticData = [];

        for (var user in dataSets) {
          statisticData.push(dataSets[ user ]);
        }

        return callback(null, {
          labels:   labels,
          datasets: statisticData
        });
      });
  });
};

