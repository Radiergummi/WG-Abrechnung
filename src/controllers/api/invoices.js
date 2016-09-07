'use strict';

/*
 global module,
 require
 */

var invoiceModel = require('../../models/invoice'),
    ObjectId     = require('mongoose').Types.ObjectId;

var invoicesApi = module.exports = {};

invoicesApi.getInvoices = function(req, res, next) {
  return invoiceModel
    .find({})
    .populate({ path: 'tags', model: 'tag' })
    .exec(function(error, invoices) {
      if (error) {
        return res.status(500).json({
          status:  500,
          reason:  'db-error',
          message: {
            raw:         error.message,
            translation: '[[global:server_error]]'
          }
        });
      }

      return res.json(invoices);
    });
};

invoicesApi.getInvoice = function(req, res, next) {
  var invoiceId = req.params.id;

  if (!ObjectId.isValid(invoiceId)) {
    return res.status(400).json({
      status:  400,
      reason:  'invalid-id',
      message: {
        raw:         'the invoice ID ' + req.params.id + ' is no valid ObjectID',
        translation: '[[invoices:invalid_invoice]]'
      }
    });
  }

  return invoiceModel
    .findOne({ _id: invoiceId })
    .populate({ path: 'tags', model: 'tag' })
    .exec(function(error, invoice) {
      if (error) {
        return res.status(400).json({
          status:        500,
          reason:        'db-error',
          message:       {
            raw:         error.message,
            translation: '[[global:server_error]]'
          },
          originalError: error
        });
      }

      if (!invoice) {
        return res.status(404).json({
          status:  404,
          reason:  'no-entity',
          message: {
            raw:         'the invoice ' + req.params.id + ' does not exist',
            translation: '[[invoices:invalid_invoice]]'
          }
        });
      }

      return res.json(invoice);
    });
};

invoicesApi.createInvoice = function(req, res, next) {
};
