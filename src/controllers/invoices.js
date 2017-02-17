'use strict';

/*
 global module,
 require
 */

const debug   = require('debug')('flatm8:controllers:invoices'),
      Invoice = require('../invoice');

const invoices = module.exports = {};

invoices.redirectToInvoices = (req, res, next) => res.redirect('/invoices');

invoices.viewSingle = function(req, res, next) {
  var vars = {
//  clientScripts: [ { name: 'invoices.single' } ],
    invoicesActive: true,
    success:        req.query.success
  };

  Invoice.getById(req.params.id, function(error, data) {
    if (error) {
      return next(error);
    }

    debug('found invoice %s:', data._id, data);
    vars.pageTitle                     = 'Rechnung ' + req.params.id;
    vars.invoice                       = data;
    vars.invoice.formattedCreationDate = data.getFormattedDate();
    vars.invoice.ownInvoice            = (String(vars.invoice.user._id) === String(req.user._id));
    vars.invoice.tags                  = data.tags.filter(tag => !!tag);

    return res.render('invoices/single', vars);
  });
};

invoices.viewAll = function(req, res, next) {
  var vars  = {
        clientScripts:  [ { name: 'invoices.all' } ],
        invoicesActive: true,
        pageTitle:      'Rechnungen'
      },
      limit = (req.params.pageNum ? (Math.floor(req.params.pageNum) * 2 + 3) : 4);

  Invoice.getPaginated(0, limit, function(error, data) {
    if (error) {
      return next(error);
    }

    vars.invoices = data.map(invoice => {
      invoice.formattedCreationDate = invoice.getFormattedDate();
      invoice.ownInvoice            = (String(invoice.user._id) === String(req.user._id));
      invoice.tags.filter(tag => !!tag);

      return invoice;
    });

    return res.render('invoices/all', vars);
  });
};

invoices.create = function(req, res, next) {
  var vars = {
    clientScripts:  [ { name: 'invoices.create' } ],
    invoicesActive: true,
    todayDate:      new Date().toISOString().substring(0, 10),
    pageTitle:      'Neu'
  };

  return res.render('invoices/create', vars);
};

invoices.delete = function(req, res, next) {
  var vars = {
    invoicesActive: true,
    pageTitle:      'Rechnung löschen'
  };

  return res.render('invoices/delete', vars);
};

invoices.edit = function(req, res, next) {
  var vars = {
    clientScripts:  [ { name: 'invoices.edit' } ],
    invoicesActive: true,
    pageTitle:      'Rechnung bearbeiten'
  };

  Invoice.getById(req.params.id, function(error, invoice) {
    if (error) {
      return next(error);
    }

    debug(invoice);
    vars.invoice           = invoice;
    vars.invoice.inputDate = invoice.getHTMLInputDate();
    vars.invoice.tagList   = invoice.tags.filter(tag => !!tag).map(tag => tag.name).join(',');

    return res.render('invoices/edit', vars);
  });
};

invoices.search = function(req, res, next) {
  var vars = {
    clientScripts:  [ { name: 'invoices.search' } ],
    invoicesActive: true,
    pageTitle:      'Suche'
  };

  if (req.params.query) {
    return Invoice.find({
      query: req.params.query
    }, function(error, invoices) {
      if (error) {
        return next(error);
      }

      vars.results      = JSON.parse(JSON.stringify(invoices));
      vars.singleResult = (invoices.length === 1);
      vars.query        = req.params.query;

      for (var i = 0; i < invoices.length; i++) {
        vars.results[ i ].creationDate = invoices[ i ].getFormattedDate();
        vars.results[ i ].ownInvoice   = (invoices[ i ].user._id == req.user._id.toString());
      }

      return res.render('invoices/search', vars);
    });
  }

  vars.results = [];
  vars.noQuery = true;

  return res.render('invoices/search', vars);
};
