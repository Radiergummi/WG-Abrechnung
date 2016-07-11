'use strict';

/*
 global module,
 require
 */

var User = require('../user');

var invoices = module.exports = {};

invoices.all = function (req, res, next) {
  var vars = {};

  User.getInvoices(req.user.id, function (error, data) {
    if (error) {
      return next(error);
    }

//    vars.invoices = JSON.parse(JSON.stringify(data));
vars.invoices = [
  {
    creationDate: '1. Mai 2016',
    _id: 'foo1',
    sum: '500'
  },
  {
    creationDate: '2. Mai 2016',
    _id: 'foo2',
    sum: '300'
  }
];
    return res.render('invoices/all', vars);
  });
};

invoices.create = function (req, res, next) {

  var vars = {};

  return res.render('invoices/create', vars);
};
