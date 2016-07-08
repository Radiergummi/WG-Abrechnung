'use strict';

/*
 global module,
 require
 */

var helpers = require('./helpers');

var main = module.exports = {};

main.home = function (req, res, next) {
  res.redirect('/dashboard');
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
