'use strict';

/*
 global module,
 require
 */
var deepExtend = require('deep-extend'),
    nconf      = require('nconf');

var file = require('../meta/file');

/**
 * Override res.render to do any pre/post processing
 */
module.exports = function (middleware) {
  middleware.processRender = function (req, res, next) {
    var render = res.render;

    res.render = function (template, variables, callback) {
      var self = this;
      var req  = this.req;

      var defaultCallback = function (error, string) {
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


      var baseVariables                  = {};
      baseVariables.loggedIn             = req.hasOwnProperty('user');
      baseVariables.template             = { name: template };
      baseVariables.template[ template ] = true;
      res.locals.template                = template;
      baseVariables._locals              = undefined;

      if (baseVariables.loggedIn) {
        baseVariables.user                   = JSON.parse(JSON.stringify(req.user));
        baseVariables.user.loggedIn          = true;
        baseVariables.user.id                = req.user.id;
        baseVariables.user.name              = req.user.firstName + ' ' + req.user.lastName;
        baseVariables.user.isAdmin           = (req.user.admin);
        baseVariables.user.hasProfilePicture = file.existsSync('public/images/users/' + req.user.id + '.jpg');
      }

      baseVariables.bodyClass   = buildBodyClass(req);
      baseVariables.url         = (req.baseUrl + req.path).replace(/^\/api/, '');
      baseVariables.cacheBuster = Date.now();

      deepExtend(variables, baseVariables);
      variables.pageTitle = (variables.pageTitle ? variables.pageTitle + ' | ' : '') + nconf.get('name');
      
      return render.call(self, template, variables, function (error, str) {
        if (error) {
          return callback(error);
        }

        return callback(error, str);
      });
    };

    next();
  };

  function buildBodyClass(req) {
    var clean = req.path.replace(/^\/|\/$/g, '');
    var parts = clean.split('/').slice(0, 3);
    parts.forEach(function (part, index) {
      parts[ index ] = index ? parts[ 0 ] + '-' + part : 'page-' + (part || 'home');
    });
    return parts.join(' ');
  }
};
