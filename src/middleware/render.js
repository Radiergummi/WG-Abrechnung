'use strict';

/*
 global module,
 require
 */
var debug      = require('debug')('flatm8:render'),
    deepExtend = require('deep-extend'),
    nconf      = require('nconf');

var file       = require('../meta/file'),
    translator = require('../../public/javascripts/src/modules/translator');

/**
 * Override res.render to do any pre/post processing
 */
module.exports = function(middleware) {
  middleware.processRender = function(req, res, next) {
    var render = res.render;

    res.render = function(template, variables, callback) {
      var self = this;
      var req  = this.req;

      var defaultCallback = function(error, string) {
        if (error) {
          return next(error);
        }

        self.send(string);
      };

      variables = variables || {};
      if (typeof variables === 'function') {
        callback  = variables;
        variables = {};
      }

      if (typeof callback !== 'function') {
        callback = defaultCallback;
      }

      debug('creating base view variables');
      var baseVariables                  = {};
      baseVariables.loggedIn             = req.hasOwnProperty('user');
      baseVariables.template             = { name: template };
      baseVariables.template[ template ] = true;
      res.locals.template                = template;
      baseVariables._locals              = undefined;
      baseVariables.debug                = (nconf.get('environment') === 'development');

      if (baseVariables.loggedIn) {
        debug('adding user to view variables');
        baseVariables.user                   = JSON.parse(JSON.stringify(req.user));
        baseVariables.user.loggedIn          = true;
        baseVariables.user.id                = req.user.id;
        baseVariables.user.name              = req.user.firstName + ' ' + req.user.lastName;
        baseVariables.user.language          = req.user.language;
        baseVariables.user.email             = req.user.email;
        baseVariables.user.isAdmin           = (req.user.role === 'admin');
        baseVariables.user.hasProfilePicture = file.existsSync('public/images/users/' + req.user.id + '.jpg');
        baseVariables.user.color             = req.user.color;
      }

      baseVariables.language = (req.hasOwnProperty('user')
          ? req.query.lang || baseVariables.user.language
          : req.query.lang || nconf.get('language')
      );

      if (req.query.lang) {
        debug('set language to %s', req.query.lang);
      }

      baseVariables.bodyClass     = buildBodyClass(req);
      baseVariables.url           = (req.baseUrl + req.path).replace(/^\/api/, '');
      baseVariables.cacheBuster   = Date.now();
      baseVariables.csrfToken     = (req.csrfToken
          ? req.csrfToken()
          : ''
      );
      baseVariables.clientScripts = (variables.clientScripts
          ? [ { name: 'base' } ].concat(variables.clientScripts)
          : [ { name: 'base' } ]
      );

      deepExtend(variables, baseVariables);
      variables.pageTitle = (variables.pageTitle ? variables.pageTitle + ' | ' : '') + nconf.get('name');

      debug('rendering view');
      return render.call(self, template, variables, function(error, str) {
        if (error) {

          debug('view renderer encountered an error: ' + error.message);
          return callback(error);
        }

        debug('set template language to %s', baseVariables.language);

        debug('translating template');
        translator.translate(str, baseVariables.language, function(translatedStr) {

          debug('template translated. calling callback');
          return callback(error, translatedStr);
        });
      });
    };

    next();
  };

  function buildBodyClass (req) {
    var clean = req.path.replace(/^\/|\/$/g, '');
    var parts = clean.split('/').slice(0, 3);
    parts.forEach(function(part, index) {
      parts[ index ] = index ? parts[ 0 ] + '-' + part : 'page-' + (part || 'home');
    });
    return parts.join(' ');
  }
};
