'use strict';

/*
 global module,
 require
 */

var fs      = require('fs'),
    nconf   = require('nconf'),

    Invoice = require('../invoice'),

    api     = module.exports = {
      invoices: require('./api/invoices'),
      users:    require('./api/users'),
      user:     require('./api/user')
    };

api.listEndpoints = function(req, res, next) {
  var endpoints = {};

  return res.json(endpoints);
};

api.createNewInvoice = function(req, res) {
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

        fs.writeFile(
          nconf.get('path') + '/public/images/invoices/' + req.user._id + '/' + newInvoice._id + '.jpg',
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
      console.log(error);
      return res.status(500).send(error);
    })

    /**
     * send the response
     */
    .then(function(newInvoice) {
      return res.status(200).redirect('/invoices/' + newInvoice._id + '?success=true');
    })
};
