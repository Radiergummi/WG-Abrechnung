'use strict';

/*
 global module,
 require
 */

var async = require('async'),
    nconf = require('nconf');

var app,
    User = require('../user');

var controllers = {
      helpers: require('../controllers/helpers')
    },
    middleware  = {};

/**
 * Authenticates a user
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
middleware.checkAuth = function (req, res, next) {
  if (req.user) {
    return next();
  } else {
    console.log(req.user);
  }

  return controllers.helpers.notAllowed(req, res);
};

/**
 * Checks if a user is an admin
 *
 * @param req
 * @param res
 * @param next
 */
middleware.isAdmin = function (req, res, next) {
  if (! req.user) {
    return controllers.helpers.notAllowed(req, res);
  }

  if (req.user.role !== 'admin') {
    return controllers.helpers.noPermission(req, res);
  }

  return next(null);
};


/**
 * Adds expiration headers
 * @param req
 * @param res
 * @param next
 */
middleware.addExpiresHeaders = function (req, res, next) {
  if (app.enabled('cache')) {
    res.setHeader("Cache-Control", "public, max-age=5184000");
    res.setHeader("Expires", new Date(Date.now() + 5184000000).toUTCString());
  } else {
    res.setHeader("Cache-Control", "public, max-age=0");
    res.setHeader("Expires", new Date().toUTCString());
  }

  next();
};


/**
 * adds response headers
 *
 * @param req
 * @param res
 * @param next
 */
middleware.addHeaders = function (req, res, next) {
  var headers = {
    'X-Powered-By':                'Mo-Express-Framework',
    'X-Frame-Options':             'SAMEORIGIN',
    'Access-Control-Allow-Origin': 'null'	// yes, string null.
  };

  for (var key in headers) {
    if (headers.hasOwnProperty(key)) {
      res.setHeader(key, headers[ key ]);
    }
  }

  next();
};

module.exports = function(webserver) {
  app = webserver;

  require('./render')(middleware);

  return middleware;
};
