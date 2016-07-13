'use strict';

/*
 global module,
 require
 */

var User    = require('../user'),
    Invoice = require('../invoice');

var invoices = module.exports = {};

invoices.viewSingle = function (req, res, next) {
  var vars = {};

  Invoice.getById(req.params.id, function (error, data) {
    if (error) {
      return next(error);
    }

    vars.userInvoices = JSON.parse(JSON.stringify(data));

    return res.render('invoices/single', vars);
  });
};

invoices.viewAll = function (req, res, next) {
  var vars = {};

  User.getPaginatedInvoices(req.user.id, 0, 4, function (error, data) {
    if (error) {
      return next(error);
    }

    vars.userInvoices = JSON.parse(JSON.stringify(data));

    return res.render('invoices/all', vars);
  });
};

invoices.create = function (req, res, next) {
  var vars = {};

  vars.todayDate = new Date().toISOString().substring(0, 10);

  return res.render('invoices/create', vars);
};

invoices.delete = function (req, res, next) {
  var vars = {};

  return res.render('invoices/delete', vars);
};

invoices.edit = function (req, res, next) {
  var vars = {};

  Invoice.getById(req.params.id, function (error, invoice) {
    if (error) {
      return next(error);
    }

    vars.invoice = JSON.parse(JSON.stringify(invoice));
    vars.invoice.inputDate = invoice.getHTMLInputDate();

    return res.render('invoices/edit', vars);
  });
};
