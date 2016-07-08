'use strict';

/*
 global module,
 require
 */

var mongo = require('mongodb'),
    mongoose = require('mongoose');

var invoiceModel = require('./models/invoice');

var Invoice = module.exports = {};

/**
 * @callback invoiceCallback
 *
 * @param {Error} [error]  an error object, if one occurred
 * @param {*} [data]       invoice data, if any
 */

/**
 * retrieves invoice data from the database by ID
 *
 * @param {string} id  the ID to find a invoice for
 * @param {invoiceCallback} callback  a callback to run on the invoice object
 * @returns {object}
 */
Invoice.getById = function(id, callback) {
  invoiceModel.findOne({ '_id': id }).populate('tags').exec(function(error, invoice) {
    if (error) {
      return callback(error);
    }

    if (!invoice) {
      return callback(new Error('Die angegebene Rechnung mit der ID ' + id + ' existiert nicht'));
    }

    callback(null, invoice);
  });
};


Invoice.getAll = function(callback) {
  invoiceModel.find({}).populate('tags').exec(function(error, invoice) {
    if (error) return callback(error);
    if (!invoice) return callback(null, []);

    return callback(null, invoice);
  });
};


Invoice.createNew = function(data, callback) {
  var newInvoice = new invoiceModel();

  newInvoice.creationDate = Date.now();

  if (data.hasOwnProperty('sum')) {
    newInvoice.sum = data.sum;
  }

  if (data.hasOwnProperty('tags')) {
    newInvoice.tags = data.tags;
  }

  newInvoice.save(function(error) {
    if (error) {
      return callback(error);
    }

    return callback(null, newInvoice);
  })
};


Invoice.remove = function(id, callback) {
  this.getById(id, function(error, invoice) {
    if (error) {
      return callback(error);
    }

    var deletedInvoice = JSON.parse(JSON.stringify(invoice));
    invoice.remove();

    return callback(null, deletedInvoice);
  });
};


Invoice.addTag = function(id, tagId, callback) {
  this.getById(id, function(error, invoice) {
    if (error) {
      return callback(error);
    }

    invoice.tags.push(mongoose.Schema.Types.ObjectId(tagId));

    invoice.save(function(error) {
      if (error) {
        return callback(error);
      }

      return callback();
    });
  });
};
