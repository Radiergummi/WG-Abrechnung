/*
 global module,
 require
 */

var nconf = require('nconf'),
    path = require('path'),
    express = require('express'),
    winston = require('winston'),

    helper = require('./helper'),
    controllers = require('../controllers'),

    mainRoutes = require('./main'),
    dashboardRoutes = require('./dashboard'),
    authenticationRoutes = require('./authentication');

var setupPageRoute = helper.setupPageRoute;

module.exports = function(app, middleware) {
  var router = express.Router();

  mainRoutes(router, middleware, controllers);
  authenticationRoutes(router, middleware, controllers);
  dashboardRoutes(router, middleware, controllers.dashboard);

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
