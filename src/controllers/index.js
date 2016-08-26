'use strict';

/*
 global module,
 require
 */

var colors = require('colors'),
    nconf = require('nconf'),
    winston = require('winston');

var controllers = require('./main');
controllers.helpers = require('./helpers');
controllers.dashboard = require('./dashboard');
controllers.invoices = require('./invoices');
controllers.statistics = require('./statistics');
controllers.authentication = require('./authentication');
controllers.api = require('./api');

controllers.handle404Errors = function(req, res, next) {
  var err = new Error('Page Not Found: ' + req.url);

  err.status = 404;
  err.stack = err.stack.replace(new RegExp('(' + nconf.get('path').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + ')+', 'g'), '').trim();
  next(err);
};

controllers.handleErrors = function(error, req, res, next) {
  if (typeof error === 'string') {
    res.status(500).send(error);
    return winston.error(error);
  }

  var path  = nconf.get('path'),
      stack = error.stack.toString().split(path).join(''),
      origin,
      file,
      line;

  // prepare the error stack
  try {
    origin = error.stack.match((new RegExp(path.replace(/\//g, '\\/') + '\/(.*)+:([0-9]+):([0-9]+)'))).slice(1);
    file   = origin[ 0 ].split(path).join('') + (origin[ 0 ].indexOf('(') !== - 1 ? ')' : '');
    line   = origin[ 1 ];
  }
  catch (e) {
    origin = error.stack.match(/at (.[^:])+:([0-9]+):([0-9]+)/).slice(1);
    file   = (origin[ 0 ].indexOf('(') !== - 1 ? ')' : '') + ' [from module]';
    line   = origin[ 1 ];
  }

  // set status code
  var status = error.status || 500;
  res.status(status);

  if (error.status !== 404) {

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
  
  res.render('errors/' + status, {
    error: {
      status:  status,
      name:    'Internal Server Error',
      message: 'Something went wrong.',
      file: file,
      line: line,
      stack: error.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  });
};

module.exports = controllers;
