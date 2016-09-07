'use strict';

/*
 global module,
 require
 */

var async = require('async'),
    csurf = require('csurf'),
    debug = require('debug'),
    nconf = require('nconf');

var app,
    User    = require('../user'),
    Invoice = require('../invoice');

var controllers = require('../controllers'),
    middleware  = {};

/**
 * Authenticates a user
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
middleware.checkAuth = function(req, res, next) {
  if (req.user) {
    return next();
  } else {
    debug('no user in request');
  }

  return controllers.handle401Errors(req, res, next);
};

/**
 * Checks if a user is an admin
 *
 * @param req
 * @param res
 * @param next
 */
middleware.isAdmin = function(req, res, next) {
  if (!req.user) {
    return controllers.handle401Errors(req, res, next);
  }

  if (req.user.role !== 'admin') {
    return controllers.helpers.noPermission(req, res, next);
  }

  return next();
};

/**
 * sets the isApiRequest parameter to true
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
middleware.isApiRequest = function(req, res, next) {
  res.locals.isApiRequest = true;
  return next();
};

/**
 * Adds expiration headers
 * @param req
 * @param res
 * @param next
 */
middleware.addExpiresHeaders = function(req, res, next) {
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
middleware.addHeaders = function(req, res, next) {
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

middleware.csrf = csurf();

/**
 * checks if a user owns an invoice
 *
 * @param req
 * @param res
 * @param next
 */
middleware.checkInvoicePermissions = function(req, res, next) {
  Invoice.checkOwnership(req.user._id, req.params.id, function(isOwner) {
    if (!isOwner) {
      return controllers.helpers.noPermission(req, res);
    }

    return next();
  });
};

module.exports = function(webserver) {
  app = webserver;

  require('./render')(middleware);

  return middleware;
};
