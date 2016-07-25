'use strict';

/*
 global module,
 require
 */

var moment = require('moment');

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
          spanGaps: true,
          afterLabel: function(tooltipItem, data) {
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
          spanGaps: true,
          afterLabel: function(tooltipItem, data) {
            console.log(tooltipItem);
            console.log(data);
          }
        };
      });

      return resolve(dataSets);
    });
  }).then(function(dataSets) {
    Invoice.getByMonth(month, function(error, dates) {
      if (error) {
        throw error;
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
        for (var i = 0; i < dates[ date ].length; i++) {
          var currentInvoice = dates[ date ][ i ],
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

