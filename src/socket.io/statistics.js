'use strict';

/*
 global module,
 require
 */

var Invoice = require('../invoice');

var statisticsSockets = module.exports = {};

statisticsSockets.getInvoiceSumByUser = function (socket, id, callback) {
  return Invoice.getSums(id, function (error, data) {
    if (error) {
      return callback(error);
    }

    return callback(null, data);
  });
};

statisticsSockets.getOwnInvoiceSum = function (socket, callback) {
  return Invoice.getSums(socket._id, function (error, data) {
    if (error) {
      return callback(error);
    }

    return callback(null, data);
  });
};


statisticsSockets.getInvoiceStatistics = function (socket, callback) {
  return Invoice.getByUser(function (error, data) {
    if (error) {
      return callback(error);
    }

    var statisticsData = [];

    for (var user in data) {
      if (! data.hasOwnProperty(user)) {
        continue;
      }

      var sumData = [],
          userColor = JSON.parse(JSON.stringify(data[ user ][ 0 ].user.color));

      for (var i = 0; i < data[ user ].length; i ++) {
        sumData.push(data[ user ][ i ].sum);
      }

      statisticsData.push({
        label:                     data[ user ][ 0 ].user.firstName + ' ' + data[ user ][ 0 ].user.lastName,
        data:                      sumData,
        fill:                      true,
        lineTension:               0,
        backgroundColor:           userColor.replace(/, 1\)$/, ', .2)'),
        borderColor:               userColor,
        borderCapStyle:            'butt',
        borderDash:                [],
        borderDashOffset:          0.0,
        borderJoinStyle:           'round',
        pointBorderColor:          userColor.replace(/, 1\)$/, ', .75)'),
        pointBackgroundColor:      '#fff',
        pointBorderWidth:          3,
        pointHoverRadius:          4,
        pointHoverBackgroundColor: userColor.replace(/, 1\)$/, ', .2)'),
        pointHoverBorderColor:     "#fff",
        pointHoverBorderWidth:     3,
        pointRadius:               2,
        pointHitRadius:            10,
        spanGaps:                  false
      });
    }

    return callback(null, statisticsData);
  });
};

