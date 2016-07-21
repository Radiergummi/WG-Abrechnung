'use strict';

/*
 global module,
 require
 */

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  var middlewares = [ middleware.checkAuth ];

  setupPageRoute(router, '/statistics', middleware, middlewares, controllers.overview);
};
