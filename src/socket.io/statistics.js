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

