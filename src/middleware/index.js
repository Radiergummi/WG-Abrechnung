'use strict';

/*
 global module,
 require
 */

const fs      = require('fs'),
      path    = require('path'),
      nconf   = require('nconf'),
      winston = require('winston'),
      moment  = require('moment');

/**
 * Middleware modules
 */
const favicon          = require('serve-favicon'),
      logger           = require('morgan'),
      express          = require('express'),
      cookieParser     = require('cookie-parser'),
      bodyParser       = require('body-parser'),
      hbs              = require('express-handlebars'),
      compression      = require('compression'),
      expressValidator = require('express-validator'),
      mongoose         = require('mongoose'),
      passport         = require('passport'),
      session          = require('express-session'),
      siofu            = require('socketio-file-upload'),
      flash            = require('connect-flash');

const db     = require('../database').initialize(),
      jobs   = require('../jobs'),
      auth   = require('../authentication'),
      render = require('./render');

/**
 * load the moment.js locale
 */
moment.locale(nconf.get('language'));

let middleware = {};

module.exports = function(app) {
  middleware = require('./middleware')(app);

  // register templates.js
//  app.engine('tpl', templates.__express);

  // set view path
  app.set('views', path.join(nconf.get('path'), 'src', 'views'));

  // set view engine
//  app.set('view engine', nconf.get('views:templates:engine'));

  app.engine('hbs', hbs({
    extname:       'hbs',
    defaultLayout: 'default',
    layoutsDir:    path.join(nconf.get('path'), 'src', 'views', 'layouts'),
    partialsDir:   path.join(nconf.get('path'), 'src', 'views', 'partials')
  }));

  app.set('view engine', 'hbs');

  // register template helpers
  registerTemplateHelpers();

  // add JSON indenting
  app.set('json spaces', 2);

  /**
   * Load standard middleware to apply on any request
   */

  // if we are in dev mode, enable the Morgan request logger. It will log all requests made to
  // the server to the winston log using a custom WinstonStream object.
  if (nconf.get('environment') === 'development') {
    let winstonStream = {
      write: function(message) {
        //winston.verbose('[request] ' + message.replace(/\n$/, ''));
      }
    };

    app.use(logger('dev', {
      stream: winstonStream
    }));
  }

  app.use(bodyParser.urlencoded({
    limit:    '8mb',
    extended: true
  }));
  app.use(bodyParser.json());

  app.use(compression());
  app.use(cookieParser());
  app.use(express.static(path.join(nconf.get('path'), 'public')));

  if (nconf.get('environment') === 'production') {
    app.enable('view cache');
  }

  app.use(siofu.router);

  let cookie = {
    // Set maximum login time to two weeks
    maxAge: 1000 * 60 * 60 * 24 * 14
  };

  if (nconf.get('secure')) {
    cookie.secure = true;
  }

  app.use(session({
    store:             db.sessionStore(session),
    secret:            nconf.get('secret'),
    key:               'express.sid',
    cookie:            cookie,
    resave:            true,
    saveUninitialized: true
  }));

  app.use(flash({ locals: 'messages' }));
  auth.initialize(app, middleware);
  app.use(middleware.processRender);
  jobs.initialize();

  setTimeout(function() {
    require('../socket.io').server.sockets.emit('app.updated', {
      date: Date.now()
    });
  }, 2000);

  return middleware;
};

function registerTemplateHelpers () {
}
