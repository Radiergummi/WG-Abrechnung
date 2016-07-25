'use strict';

/*
 global module,
 require
 */

var User    = require('../user'),
    Invoice = require('../invoice');

var invoices = module.exports = {};

invoices.redirectToInvoices = (req, res, next)  => res.redirect('/invoices');

invoices.viewSingle = function (req, res, next) {
  var vars = {};

  Invoice.getById(req.params.id, function (error, data) {
    if (error) {
      return next(error);
    }

    vars.pageTitle                 = 'Rechnung ' + req.params.id;
    vars.userInvoices              = JSON.parse(JSON.stringify(data));
    vars.userInvoices.creationDate = data.getFormattedDate();
    vars.userInvoices.ownInvoice   = (vars.userInvoices.user._id == req.user._id);

    return res.render('invoices/single', vars);
  });
};

invoices.viewAll = function (req, res, next) {
  var vars  = {},
      limit = (req.params.pageNum ? (Math.floor(req.params.pageNum) * 2 + 3) : 4);

  Invoice.getPaginated(0, limit, function (error, data) {
    if (error) {
      return next(error);
    }

    vars.userInvoices = JSON.parse(JSON.stringify(data));
    
    for (var i = 0; i < vars.userInvoices.length; i ++) {
      vars.userInvoices[ i ].creationDate = data[ i ].getFormattedDate();
      vars.userInvoices[ i ].ownInvoice   = (vars.userInvoices[ i ].user._id == req.user._id);
    }

    vars.pageTitle = 'Rechnungen';

    return res.render('invoices/all', vars);
  });
};

invoices.create = function (req, res, next) {
  var vars = {};

  vars.todayDate = new Date().toISOString().substring(0, 10);
  vars.pageTitle = 'Neu';

  return res.render('invoices/create', vars);
};

invoices.delete = function (req, res, next) {
  var vars = {};

  vars.pageTitle = 'Rechnung löschen';
  return res.render('invoices/delete', vars);
};

invoices.edit = function (req, res, next) {
  var vars = {};

  Invoice.getById(req.params.id, function (error, invoice) {
    if (error) {
      return next(error);
    }

    vars.invoice           = JSON.parse(JSON.stringify(invoice));
    vars.invoice.inputDate = invoice.getHTMLInputDate();
    vars.pageTitle         = 'Rechnung bearbeiten';

    return res.render('invoices/edit', vars);
  });
};

invoices.search = function (req, res, next) {
  var vars       = {};
  vars.pageTitle = 'Suche';

  if (req.params.query) {
    return Invoice.find({
      query: req.params.query
    }, function (error, invoices) {
      if (error) {
        return next(error);
      }

      vars.results      = JSON.parse(JSON.stringify(invoices));
      vars.singleResult = (invoices.length === 1);
      vars.query        = req.params.query;

      for (var i = 0; i < invoices.length; i ++) {
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
