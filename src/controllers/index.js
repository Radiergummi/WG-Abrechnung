'use strict';

/*
 global module,
 require
 */

const colors  = require('colors'),
      fs      = require('fs'),
      nconf   = require('nconf'),
      winston = require('winston');

const controllers          = require('./main');
controllers.helpers        = require('./helpers');
controllers.dashboard      = require('./dashboard');
controllers.invoices       = require('./invoices');
controllers.statistics     = require('./statistics');
controllers.authentication = require('./authentication');
controllers.api            = require('./api');

controllers.handle401Errors = function(req, res, next) {
  var error    = new Error('Not Authorized');
  error.status = 401;
  next(error);
};

controllers.handle404Errors = function(req, res, next) {
  var error = new Error('Page Not Found: ' + req.url);

  error.status = 404;
  error.stack  = error.stack.replace(new RegExp('(' + nconf.get('path').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + ')+', 'g'), '').trim();

  if (res.locals.isApiRequest) {
    res.status(404).json({
      status:  404,
      reason:  'no-entity',
      message: {
        raw:         req.url + ' does not exist',
        translation: '[[global:page_not_found]]'
      }
    })
  }

  return next(error);
};

controllers.handleErrors = function(error, req, res, next) {
  if (typeof error === 'string') {
    winston.error(error);
    return res.status(500).send(error);
  }

  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      status:  403,
      reason:  'invalid-csrf',
      message: {
        raw:         'invalid CSRF token',
        translation: '[[global:server_error]]'
      }
    });
  }

  let path  = nconf.get('path'),
      stack = error.stack.toString().split(path).join(''),
      origin,
      file,
      line;

  // prepare the error stack
  try {
    origin = error.stack.match((new RegExp(path.replace(/\//g, '\\/') + '\/(.*)+:([0-9]+):([0-9]+)'))).slice(1);
    file   = origin[ 0 ].split(path).join('') + (origin[ 0 ].indexOf('(') !== -1 ? ')' : '');
    line   = origin[ 1 ];
  }
  catch (e) {
    origin = error.stack.match(/at (.[^:])+:([0-9]+):([0-9]+)/).slice(1);
    file   = (origin[ 0 ].indexOf('(') !== -1 ? ')' : '') + ' [from module]';
    line   = origin[ 1 ];
  }

  // set status code
  var status = error.status || 500;
  res.status(status);

  if ((error.status !== 404) && (error.status !== 401)) {

    // log the error to console
    console.error("\n" + error.name.bold.white);
    console.error(error.message.bgRed.white + "\n");
    console.error('Origin'.bold.white);
    console.error(file.bgRed.white + ' on line '.bgRed.white + line.bgRed.white + "\n");
    console.error('Trace'.bold.white);
    console.error(stack.red + "\n");
  } else {
    winston.error(req.method + ' ' + req.path + ': ' + '404 Not found'.red);
  }

  if (res.locals.isApiRequest) {
    if (error.status === 401) {
      return res.json({
        status:  401,
        reason:  'authentication',
        message: {
          raw:         'Not authorized to request ' + req.url,
          translation: '[[global:not_authorized]]'
        }
      });
    }

    if (error.status === 403) {
      return res.json({
        status:  403,
        reason:  'invalid-csrf',
        message: {
          raw:         'invalid CSRF token',
          translation: '[[global:server_error]]'
        }
      });
    }

    return res.json({
      status:  status,
      reason:  error.name,
      message: {
        raw:         error.message,
        translation: '[[global:server_error]]'
      }
    });
  } else {
    if (error.status === 401) {
      return res.redirect('/login?redirect_to=' + encodeURI(req.path));
    }
  }

  return res.render('errors/' + status, {
    error: {
      status:  status,
      name:    'Internal Server Error',
      message: 'Something went wrong.',
      file:    file,
      line:    line,
      stack:   error.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  });
};

module.exports = controllers;
