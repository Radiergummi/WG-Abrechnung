'use strict';

/*
 global module,
 require
 */

(function(Auth) {
  var passport        = require('passport'),
      localStrategy   = require('passport-local').Strategy,
      nconf           = require('nconf'),
      winston         = require('winston'),
      express         = require('express'),

      controllers     = require('./controllers'),
      userModel       = require('./models/user'),

      Event           = require('./event'),

      loginStrategies = [];

  Auth.initialize = function(app, middleware) {
    app.use(passport.initialize());
    app.use(passport.session());

    Auth.app = app;
    Auth.middleware = middleware;

    passport.use('local-login', new localStrategy(
      {
        usernameField:     'user',
        passwordField:     'pass',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },

      // callback with email and password from our form
      function(req, username, password, callback) {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        userModel.findOne({ 'authentication.username': username }, function(error, user) {

          // if there are any errors, return the error before anything else
          if (error) {
            return callback(error);
          }

          // if no user is found, return the message
          if (!user) {

            // req.flash is the way to set flash data using connect-flash
            return callback(null, false, req.flash('error', 'Die angebenen Anmeldeinformationen sind ungültig.'));
          }

          // if the user is found but the password is wrong
          if (!user.validPassword(password)) {
            // create the loginMessage and save it to session as flash data
            return callback(null, false, req.flash('error', 'Die angebenen Anmeldeinformationen sind ungültig.'));
          }

          Event.push('user:logged-in', user.firstName + ' ' + user.lastName, 'authentication', {
            description: 'hat sich angemeldet',
            ip:          req.session.ip
          });

          return callback(null, user);
        });
      }));
  };

  Auth.login = passport.authenticate('local-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash:    true
  });

  Auth.getLoginStrategies = function() {
    return loginStrategies;
  };

  // used to serialize the user for the session
  passport.serializeUser(function(user, callback) {
    callback(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, callback) {
    userModel.findById(id, function(err, user) {
      callback(err, user);
    });
  });
}(exports));
