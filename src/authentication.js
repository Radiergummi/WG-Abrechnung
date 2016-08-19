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
      User            = require('./user'),

      loginStrategies = [];

  Auth.initialize = function(app, middleware) {
    app.use(passport.initialize());
    app.use(passport.session());

    Auth.app        = app;
    Auth.middleware = middleware;

    passport.use('local-login', new localStrategy(
      {
        usernameField:     'user',
        passwordField:     'pass',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
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
            return callback(null, false, req.flash('error', '[[clientError:invalid_login_credentials]]'));
          }

          // if the user is found but the password is wrong
          if (!user.validPassword(password)) {

            // create the loginMessage and save it to session as flash data
            return callback(null, false, req.flash('error', '[[clientError:invalid_login_credentials]]'));
          }

          Event.push(
            'user:logged-in',
            '[[events:user_logged_in, ' + user.firstName + user.lastName + ']]',
            'authentication', {
              ip: req.session.ip
            }
          );

          return callback(null, user);
        });
      })
    );

    passport.use('local-register', new localStrategy(
      {
        usernameField:     'username',
        passwordField:     'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function(req, username, password, callback) {

        var existingChecks = [

          // check for the email address
          new Promise(function(resolve, reject) {
            return User.getByEmail(req.body.email, function(error, user) {
              if (error) {
                return reject(error);
              }

              return resolve(user);
            });
          }),

          // check for the username
          new Promise(function(resolve, reject) {
            return User.getByUsername(username, function(error, user) {
              if (error) {
                return reject(error);
              }

              return resolve(user);
            });
          })
        ];

        // let the promises run, then check if the results yielded any users
        Promise.all(existingChecks).then(function(results) {
          if (!results.isNull()) {
            return callback(null, false, req.flash('error', '[[clientError:user_already_exists]]'))
          }

          User.createNew({
            firstName: req.body.firstName,
            lastName:  req.body.lastName,
            email:     req.body.email,
            role:      'normal',
            language:  req.body.language || undefined,
            color:     req.body.color,
            username:  username,
            password:  password
          }, function(error, newUser) {
            if (error) {
              return callback(error);
            }

            return callback(null, newUser);
          });
        }).catch(function(error) {
          if (error) {
            return callback(error);
          }
        });

        // we are checking to see if the user trying to register already exists
       /* userModel.findOne({ 'authentication.username': username }, function(error, user) {
          if (error) {
            return callback(error);
          }

          // if the user already exists, return an error
          if (user) {

            return callback(null, false, req.flash('error', '[[clientError:invalid_login_credentials]]'));
          }

          // if the user is found but the password is wrong
          if (!user.validPassword(password)) {

            // create the loginMessage and save it to session as flash data
            return callback(null, false, req.flash('error', '[[clientError:invalid_login_credentials]]'));
          }

          Event.push(
            'user:logged-in',
            '[[events:user_logged_in, ' + user.firstName + user.lastName + ']]',
            'authentication', {
              ip: req.session.ip
            }
          );

          return callback(null, user);
        });*/
      })
    );
  };

  Auth.login = passport.authenticate('local-login', {
    successReturnToOrRedirect: '/dashboard',
    failureRedirect:           '/login',
    failureFlash:              true
  });

  Auth.register = passport.authenticate('local-register', {
    successReturnToOrRedirect: '/dashboard',
    failureRedirect:           '/register?error=true',
    failureFlash:              true
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
