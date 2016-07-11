'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  setupPageRoute(router, '/invoices', middleware, [], controllers.all);
  setupPageRoute(router, '/invoices/all', middleware, [], function(req, res, next) {
    res.redirect('/invoices');
  });
  setupPageRoute(router, '/invoices/create', middleware, [], controllers.create);
};
