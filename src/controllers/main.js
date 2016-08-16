'use strict';

/*
 global module,
 require
 */

var User = require('../user');

var helpers = require('./helpers');

var main = module.exports = {};

main.home = function (req, res, next) {
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

main.login = function (req, res, next) {
  var data = {};
  data.error = req.flash('error')[ 0 ];

  res.render('login', data);
};

main.logout = function (req, res, next) {
  var data = {};
  data.error = req.flash('error')[ 0 ];

  res.redirect('/login', data);
};
