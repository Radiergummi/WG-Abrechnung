'use strict';

/*
 global module,
 require
 */

var debug        = require('debug')('flatm8:api:invoices'),
    nconf        = require('nconf'),
    path         = require('path'),
    sharp        = require('sharp'),
    file         = require('../../meta/file'),
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

  const invoiceData = {
    user: req.user._id,
    date: req.body.creationDate || new Date(),
    sum:  req.body.sum || undefined,
    note: req.body.note || undefined,
    tags: req.body.tags
  };

  if (typeof invoiceData.tags === 'string' && invoiceData.tags.length > 0) {
    invoiceData.tags = invoiceData.tags.split(',');
  }

  if (invoiceData.tags.length < 1) {
    debug('invoice has no changed or added tags');
    return invoice;
  }

  debug(`new invoice has the following tags: %s`, invoiceData.tags.join(', '));

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

  return Promise.all(invoiceData.tags.map(processTag)).then(tagIds => {
    debug('got tags: ', tagIds);
    invoiceData.tags = Array.from(new Set(tagIds));
    return invoiceData;
  }).then(data => new Promise((resolve, reject) => {
      debug(`invoice has been tagged as ${data.tags.join(', ')}`);

      Invoice.createNew(data, function(error, newInvoice) {
        if (error) {
          debug(`error creating the invoice: ${error.message}`);
          return reject(error);
        }

        debug('invoice created successfully');
        return resolve(newInvoice);
      });
    })
  )
  /**
   * save the image file
   */
    .then(newInvoice => {
      debug(`trying to save image for invoice ${newInvoice.id}`);

      if (!req.file) {
        return;
      }

      return sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toFile(path.join(
          nconf.get('path'),
          '/public/images/invoices/',
          String(req.user._id),
          String(newInvoice._id) + '.jpg'
        ))
        .catch(error => debug('image could not be saved: %s', error))
        .then(info => newInvoice);
    })


    /**
     * send the response
     */
    .then(function(newInvoice) {
      res.status(204);
      res.set('Location', '/invoices/' + newInvoice._id + '?success=true');
      res.send({});
    })

    /**
     * catch any errors
     */
    .catch(function(error) {
      debug('invoice creation failed: ', error);
      return res.status(500).send({
        status:  500,
        reason:  'db-error',
        message: {
          raw:         'could not save invoice: ' + error.message,
          translation: '[[global:server_error]]'
        }
      });
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
    if (typeof newData.tags === 'string' && newData.tags.length > 0) {
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

    if (newData.note) {
      invoice.note = newData.note;
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
