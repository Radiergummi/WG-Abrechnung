'use strict';

var Invoice = require('../invoice'),
    helper  = require('./helpers');

var dashboard = module.exports = {};

dashboard.dash = function(req, res, next) {
  var vars = {};
  vars.user = helper.userData(req);

  Invoice.getAll(function(error, data) {
    if (error) {
      return next(error);
    }

    vars.user.invoices = JSON.parse(JSON.stringify(data));

    return res.render('dashboard', vars);
  });
};
