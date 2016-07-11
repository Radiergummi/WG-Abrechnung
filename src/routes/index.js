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
    authenticationRoutes = require('./authentication');
    apiRoutes = require('./api');


module.exports = function(app, middleware, controllers) {
  var router = express.Router();

  mainRoutes(router, middleware, controllers);
  authenticationRoutes(router, middleware, controllers);
  dashboardRoutes(router, middleware, controllers.dashboard);
  invoiceRoutes(router, middleware, controllers.invoices);
  apiRoutes(router, middleware, controllers.api);

  app.use('/', router);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Page Not Found: ' + req.url);

    err.status = 404;
    err.stack = err.stack.replace(new RegExp('(' + nconf.get('path').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + ')+', 'g'), '').trim();
    next(err);
  });

  // register error handler
  app.use(require('../errorHandler'));
};
