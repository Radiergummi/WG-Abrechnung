'use strict';

/*
 global module,
 require
 */

var User = require('../user');

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
      limit = skip + data.pageSize;

  User.getPaginatedInvoices(data.userId, skip, limit, function (error, dataSet) {
    if (error) {
      return callback(error);
    }

    return callback(null, dataSet);
  });
};
