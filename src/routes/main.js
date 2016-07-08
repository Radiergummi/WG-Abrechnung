'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  /**
   * index page:
   * uses the isLoggedIn middleware to redirect clients to the login page if necessary.
   * As each page is only available for logged in users, authentication has to happen
   * here already.
   */
  setupPageRoute(router, '/', middleware, [ middleware.checkAuth ], controllers.home);

  setupPageRoute(router, '/login', middleware, [], controllers.login);
  setupPageRoute(router, '/logout', middleware, [], controllers.authentication.logout);
};
