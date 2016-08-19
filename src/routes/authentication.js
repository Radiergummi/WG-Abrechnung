'use strict';

/*
 global module,
 require
 */

var helper = require('./helper'),
    setupPageRoute = helper.setupPageRoute,
    auth = require('../authentication');

module.exports = function(router, middleware, controllers) {
  router.post('/login', auth.login);
  router.post('/register', function(req, res, next) {
    console.log(req.body);
    return next();
  }, auth.register);
};

