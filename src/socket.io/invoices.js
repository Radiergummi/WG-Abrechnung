'use strict';

/*
 global module,
 require
 */

var User    = require('../user'),
    Invoice = require('../invoice');

var invoiceSockets = module.exports = {};

/**
 *
 * @param {object} socket
 * @param {object} data
 * @param {string} data.userId
 * @param {number} data.pageNumber
 * @param {number} data.pageSize
 * @param {function} callback
 */
invoiceSockets.getPaginated = function (socket, data, callback) {
  var skip  = (data.pageNumber > 0 ? (data.pageNumber) * data.pageSize : 0),
      limit = data.pageSize;

  Invoice.getPaginated(skip, limit, function (error, invoices) {
    if (error) {
      return callback(error);
    }

    var invoiceSet = JSON.parse(JSON.stringify(invoices));

    for (var i = 0; i < invoices.length; i ++) {
      invoiceSet[ i ].creationDate = invoices[ i ].getFormattedDate();
      invoiceSet[ i ].ownInvoice   = (invoices[ i ].user._id == socket._id);
    }

    return callback(null, invoiceSet);
  });
};

/**
 *
 * @param {object} socket
 * @param {object} data
 * @param {string} data.userId
 * @param {number} data.pageNumber
 * @param {number} data.pageSize
 * @param {function} callback
 */
invoiceSockets.getOwnPaginated = function (socket, data, callback) {
  var skip  = (data.pageNumber > 0 ? (data.pageNumber) * data.pageSize : 0),
      limit = skip + data.pageSize;

  Invoice.getOwnPaginated(socket._id, skip, limit, function (error, invoices) {
    if (error) {
      return callback(error);
    }

    return callback(null, invoices);
  });
};

invoiceSockets.search = function (socket, data, callback) {
  Invoice.find(data, function (error, invoices) {
    if (error) {
      return callback(error);
    }

        var stringifiedInvoices = JSON.parse(JSON.stringify(invoices));

    return callback(null, {
      results: stringifiedInvoices.map(function(current, index) {
        current.creationDate = invoices[ index ].getFormattedDate();
        current.ownInvoice   = (invoices[ index ].user._id == socket._id.toString());
        return current;
      }),
      singleResult: (invoices.length === 1),
      query: (data.query ? data.query : null)
    });
  });
};
