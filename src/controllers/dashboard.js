'use strict';

/*
 global module,
 require
 */

var Invoice = require('../invoice'),
    helper  = require('./helpers');

var dashboard = module.exports = {};

dashboard.dash = function (req, res, next) {
  var vars = {
    clientScripts: [ { name: 'dashboard' } ],
    user: {},
    dashboardActive: true
  };

  Invoice.getOwn(req.user._id, function (error, invoices) {
    if (error) {
      return next(error);
    }

    vars.userInvoices = JSON.parse(JSON.stringify(invoices));

    for (var i = 0; i < vars.userInvoices.length; i++) {
      vars.userInvoices[ i ].creationDate = invoices[ i ].getFormattedDate();
    }

    vars.userInvoices.reverse();

    return res.render('dashboard', vars);
  });
};
