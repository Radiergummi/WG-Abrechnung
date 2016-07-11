'use strict';

/*
 global module,
 require
 */

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


      variables.loggedIn             = req.hasOwnProperty('user');
      variables.template             = { name: template };
      variables.template[ template ] = true;
      res.locals.template = template;
      variables._locals = undefined;

      if (variables.loggedIn) {
        variables.user                   = JSON.parse(JSON.stringify(req.user));
        variables.user.loggedIn          = true;
        variables.user.id                = req.user.id;
        variables.user.name              = req.user.firstName + ' ' + req.user.lastName;
        variables.user.isAdmin           = (req.user.admin);
        variables.user.hasProfilePicture = file.existsSync('public/images/users/' + req.user.id + '.jpg');
      }

      variables.bodyClass   = buildBodyClass(req);
      variables.url         = (req.baseUrl + req.path).replace(/^\/api/, '');
      variables.cacheBuster = Date.now();

      return render.call(self, template, variables, function (error, str) {
        if (error) {
          return callback(error);
        }

        console.log(variables);

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
