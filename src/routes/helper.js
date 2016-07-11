var helper = module.exports = {};

helper.setupPageRoute = function(router, name, middleware, middlewares, controller) {

  middlewares = middlewares.concat([
    middleware.checkAuth,
    middleware.addHeaders,
    middleware.addExpiresHeaders
  ]);

  // TODO: Install too busy and header builder library
  router.get(name, middlewares, controller);
};
