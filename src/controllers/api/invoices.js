'use strict';

/*
 global module,
 require
 */

var file         = require('../../meta/file'),
    nconf        = require('nconf'),
    path         = require('path'),
    Invoice      = require('../../invoice'),
    invoiceModel = require('../../models/invoice'),
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
  new Promise(function(resolve, reject) {
    var tags = [];
    if (typeof req.body.tags === 'string' && req.body.tags.length !== 0) {
      tags = req.body.tags.split(',');
    } else {
      tags = req.body.tags;
    }

    Invoice.createNew({
      user:         req.user._id,
      creationDate: req.body.creationDate || new Date(),
      sum:          req.body.sum || undefined,
      tags:         tags
    }, function(error, newInvoice) {
      if (error) {
        return reject(error);
      }

      return resolve(newInvoice);
    });
  })

  /**
   * save the image file
   */
    .then(function(newInvoice) {
      return new Promise(function(resolve, reject) {
        if (!req.file) {
          return resolve();
        }

        file.write(path.join('public', 'images', 'invoices', req.user._id, newInvoice._id + '.jpg'),
          req.file.buffer,
          function(error) {
            if (error) {
              return reject(error);
            }

            return resolve(newInvoice);
          }
        );
      });
    })

    /**
     * catch any errors
     */
    .catch(function(error) {
      return res.status(500).send({
        status:  500,
        reason:  'db-error',
        message: {
          raw:         'could not save invoice: ' + error.message,
          translation: '[[global:server_error]]'
        }
      });
    })


    /**
     * send the response
     */
    .then(function(newInvoice) {
      res.status(204);
      res.set('Location', '/invoices/' + newInvoice._id + '?success=true');
      res.send({});
    })
};
