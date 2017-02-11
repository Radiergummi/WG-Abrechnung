'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  var middlewares                      = [ middleware.checkAuth, middleware.csrf ],
      checkInvoiceOwnershipMiddlewares = [ middleware.checkAuth, middleware.csrf, middleware.checkInvoicePermissions ];

  setupPageRoute(router, '/invoices', middleware, middlewares, controllers.viewAll);
  setupPageRoute(router, '/invoices/all', middleware, middlewares, controllers.redirectToInvoices);
  setupPageRoute(router, '/invoices/page', middleware, middlewares, controllers.redirectToInvoices);
  setupPageRoute(router, '/invoices/page/:pageNum', middleware, middlewares, controllers.viewAll);
  setupPageRoute(router, '/invoices/create', middleware, middlewares, controllers.create);
  setupPageRoute(router, '/invoices/search', middleware, middlewares, controllers.search);
  setupPageRoute(router, '/invoices/search/:query', middleware, middlewares, controllers.search);
  setupPageRoute(router, '/invoices/:id', middleware, middlewares, controllers.viewSingle);
  setupPageRoute(router, '/invoices/:id/edit', middleware, checkInvoiceOwnershipMiddlewares, controllers.edit);
  setupPageRoute(router, '/invoices/:id/delete', middleware, checkInvoiceOwnershipMiddlewares, controllers.delete);
};
