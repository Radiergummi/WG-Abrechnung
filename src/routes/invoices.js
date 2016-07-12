'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  var middlewares = [ middleware.checkAuth ];

  setupPageRoute(router, '/invoices', middleware, middlewares, controllers.viewAll);
  setupPageRoute(router, '/invoices/all', middleware, middlewares, function(req, res, next) {
    res.redirect('/invoices');
  });
  setupPageRoute(router, '/invoices/create', middleware, middlewares, controllers.create);
  setupPageRoute(router, '/invoices/:id', middleware, middlewares, controllers.viewSingle);
  setupPageRoute(router, '/invoices/:id/edit', middleware, middlewares, controllers.edit);
  setupPageRoute(router, '/invoices/:id/delete', middleware, middlewares, controllers.delete);
};
