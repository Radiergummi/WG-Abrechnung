var helper = module.exports = {};

helper.setupPageRoute = function(router, name, middleware, middlewares, controller) {
  // TODO: Install too busy and header builder library
  router.get(name, middleware.cacheBuster, /*middleware.busyCheck, middleware.buildHeader, */middlewares, controller);
};
