'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {

  var middlewares = [ middleware.checkAuth ];

  setupPageRoute(router, '/', middleware, middlewares, controllers.home);
  setupPageRoute(router, '/settings', middleware, middlewares, controllers.settings);
  setupPageRoute(router, '/login', middleware, [], controllers.login);
  setupPageRoute(router, '/logout', middleware, [], controllers.authentication.logout);
};
