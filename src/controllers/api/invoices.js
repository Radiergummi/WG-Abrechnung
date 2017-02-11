'use strict';

/*
 global module,
 require
 */

var debug        = require('debug')('flatm8:api:invoices'),
    file         = require('../../meta/file'),
    nconf        = require('nconf'),
    path         = require('path'),
    Tag          = require('../../tag'),
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
  debug('trying to create a new invoice');

  new Promise(function(resolve, reject) {
    var tags = [];
    if (typeof req.body.tags === 'string' && req.body.tags.length !== 0) {
      tags = req.body.tags.split(',');
    } else {
      tags = req.body.tags;
    }

    debug(`invoice has been tagged as ${tags.join(', ')}`);

    Invoice.createNew({
      user:         req.user._id,
      creationDate: req.body.creationDate || new Date(),
      sum:          req.body.sum || undefined,
      tags:         tags
    }, function(error, newInvoice) {
      if (error) {
        debug(`error creating the invoice: ${error.message}`);
        return reject(error);
      }

      debug('invoice created successfully');
      return resolve(newInvoice);
    });
  })

  /**
   * save the image file
   */
    .then(function(newInvoice) {

      debug(`trying to save image for invoice ${newInvoice.id}`);
      return new Promise(function(resolve, reject) {
        if (!req.file) {

          debug('invoice has no image associated');
          return resolve();
        }

        file.write(`public/images/invoices/${req.user._id}/${newInvoice._id}.jpg`,
          req.file.buffer,
          function(error) {
            if (error) {

              debug(`image could not be saved: ${error.message}`);
              return reject(error);
            }

            debug('image has been saved successfully');
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

invoicesApi.editInvoice = function(req, res, next) {
  debug('trying to edit an invoice');

  const invoiceId = req.params.id,
        newData   = req.body;

  new Promise((resolve, reject) => {
    invoiceModel
      .findOne({ _id: invoiceId })
      .exec((error, invoice) => {
        if (error) {
          debug('could not find invoice %s: %s', invoiceId, error.message);

          return reject(error);
        }

        debug('found invoice %s', invoice.id);
        return resolve(invoice);
      });
  }).then(invoice => {
    if (typeof newData.tags === 'string') {
      newData.tags = newData.tags.split(',');
    }

    if (newData.tags.length < 1) {
      debug('invoice has no changed or added tags');
      return invoice;
    }

    debug(`invoice %s has the following tags: %s`, invoiceId, newData.tags.join(', '));

    function processTag (tagName) {
      return new Promise((resolve, reject) => {

        debug('processing tag %s', tagName);

        // try to get the tag by name
        Tag.getByName(tagName, (error, tag) => {
          if (error) {
            debug('error retrieving tag %s: %s', tagName, error);
            return reject(error);
          }

          // if we have no tag, it doesn't exist yet
          if (!tag) {
            debug('tag %s does not exist yet', tagName);

            // ...so we create a new tag
            return Tag.createNew({
              tagName: tagName
            }, (error, newTag) => {
              if (error) {
                debug('could not create tag %s: %s', tagName, error);
                return reject(error);
              }

              debug('created tag %s with ID %s', tagName, newTag._id);

              // resolve with the new ID
              return resolve(newTag._id);
            });
          }

          debug('tag %s exists and has ID %s', tagName, tag._id);

          // the tag exists, so we resolve with the existing ID
          return resolve(tag._id);
        });
      });
    }

    return Promise.all(newData.tags.map(processTag)).then(tagIds => {
      debug('got tags: ', tagIds);
      invoice.tags = Array.from(new Set(tagIds));
      return invoice;
    });
  }).then(invoice => {
    debug(invoice);
    if (newData.sum) {
      invoice.sum = newData.sum;
    }

    if (newData.date) {
      invoice.date = newData.date;
    }

    invoice.save(error => {
      if (error) {
        debug('could not save invoice %s: %s', invoiceId, error);
        Promise.reject(error);
      }

      res.status(204);
      res.setHeader('Location', '/invoices/' + invoiceId);
      return res.send({});
    });
  }).then(() => {
  }, error => {
    return res.status(400).json({
      status:        500,
      reason:        'db-error',
      message:       {
        raw:         error.message,
        translation: '[[global:server_error]]'
      },
      originalError: error
    });
  })
};
