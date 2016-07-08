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
};

