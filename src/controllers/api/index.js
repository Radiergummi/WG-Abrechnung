'use strict';

/*
 global module,
 require
 */

var api = module.exports = {
  invoices: require('./invoices'),
  users:    require('./users'),
  user:     require('./user')
};

api.listEndpoints = function(req, res, next) {
  var endpoints = {};

  return res.json(endpoints);
};

api.createNewInvoice = function(req, res) {
};
