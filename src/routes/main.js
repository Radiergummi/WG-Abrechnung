'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {

  var middlewares = [ middleware.checkAuth, middleware.csrf ];

  setupPageRoute(router, '/', middleware, [ middleware.checkAuth ], controllers.home);
  setupPageRoute(router, '/settings', middleware, middlewares, controllers.settings);
  setupPageRoute(router, '/register/:token?', middleware, [], controllers.register);
  setupPageRoute(router, '/login', middleware, [], controllers.login);
  setupPageRoute(router, '/logout', middleware, [], controllers.authentication.logout);
};
