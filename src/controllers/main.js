'use strict';

/*
 global module,
 require
 */

var debug      = require('debug')('flatm8:controllers:main'),
    User       = require('../user'),
    Invitation = require('../invitation');

var helpers = require('./helpers');

var main = module.exports = {};

main.home = function(req, res, next) {
  debug('GET / - redirecting to /dashboard');
  res.redirect('/dashboard');
};

main.settings = function(req, res, next) {
  var vars = {};

  User.getAll(function(error, data) {
    if (error) {
      return next(error);
    }

    vars.users = JSON.parse(JSON.stringify(data));

    return res.render('settings', vars);
  });
};

main.register = function(req, res, next) {
  var vars = {
    token: false,
    verified: false,
    error: false
  };

  if (req.user) {
    debug('user is already logged in. redirecting to /dashboard.');
    return res.redirect('/dashboard');
  }

  vars.errorMessage = req.flash('error')[ 0 ];
  debug('flash error: %s', vars.errorMessage)

  if ((!req.params.token) && (!req.session.registrationToken)) {
    debug('token neither in URL nor in session data. rendering register page.');
    return res.render('register', vars);
  }

  if (!req.params.token) {
    if (req.session.registrationToken) {
      debug('got a token in session data: %s. redirecting to token registration page.', req.session.registrationToken);
      return res.redirect('/register/' + req.session.registrationToken)
    }
  }

  // verify the registration
  Invitation.verify(req.params.token, function(error, verified) {
    if (error) {
      debug('verification failed. deleting token in session data: %s.', req.session.registrationToken);
      delete req.session.registrationToken;

      if (error.type) {
        debug('error occurred: %s. rendering register error page.', error.type);
        vars.error = error;
        return res.render('register', vars);
      }

      debug('un-typed error. forwarding to error handler.');
      return next(error);
    }

    debug('got a token in the URL: %s', req.params.token);
    vars.token = req.params.token;

    // store the token in the user session. That will allow a retry on failure
    req.session.registrationToken = vars.token;
    vars.verified = verified;

    debug('stored token %s in session data and set verified to true. rendering register page.', req.session.registrationToken);

    return res.render('register', vars);
  });
};


main.login = function(req, res, next) {
  var data   = {};
  data.error = req.flash('error')[ 0 ];

  res.render('login', data);
};

main.logout = function(req, res, next) {
  var data   = {};
  data.error = req.flash('error')[ 0 ];

  res.redirect('/login', data);
};
