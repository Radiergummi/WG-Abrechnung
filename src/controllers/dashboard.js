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
    user: {}
  };

  Invoice.getAll(function (error, data) {
    if (error) {
      return next(error);
    }

    vars.user.userInvoices = JSON.parse(JSON.stringify(data));

    return res.render('dashboard', vars);
  });
};
