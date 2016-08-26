/*
 global module,
 require
 */

var nconf = require('nconf'),
    path = require('path'),
    express = require('express'),
    winston = require('winston'),

    helper = require('./helper'),

    mainRoutes = require('./main'),
    dashboardRoutes = require('./dashboard'),
    invoiceRoutes = require('./invoices'),
    statisticsRoutes = require('./statistics'),
    authenticationRoutes = require('./authentication');
    apiRoutes = require('./api');


module.exports = function(app, middleware, controllers) {
  var router = express.Router();

  mainRoutes(router, middleware, controllers);
  authenticationRoutes(router, middleware, controllers);
  dashboardRoutes(router, middleware, controllers.dashboard);
  invoiceRoutes(router, middleware, controllers.invoices);
  statisticsRoutes(router, middleware, controllers.statistics);
  apiRoutes(router, middleware, controllers.api);

  app.use('/', router);

  // catch 404 and forward to error handler
  app.use(controllers.handle404Errors);

  // catch other errors
  app.use(controllers.handleErrors);

  // register error handler
  app.use(require('../errorHandler'));
};
