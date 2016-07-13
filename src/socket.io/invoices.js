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
invoiceSockets.getPaginated = function(socket, data, callback) {
  data.pageNumber = data.pageNumber - 1;
  var skip  = (data.pageNumber > 0 ? (data.pageNumber - 1) * data.pageSize : 0),
      limit = data.pageSize;

  User.getPaginatedInvoices(data.userId, skip, limit, function(error, dataSet) {
    if (error) {
      return callback(error);
    }

    return callback(null, dataSet);
  });
};
