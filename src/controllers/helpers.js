'use strict';

/*
 global module,
 require
 */
var Event   = require('../event'),

    helpers = module.exports = {};

helpers.notAllowed = function(req, res) {
  res.status(401);
  res.redirect('/login');
};

helpers.noPermission = function(req, res) {
  Event.push('user:access-denied', req.user.firstName + ' ' + req.user.lastName, 'security', {
    description: 'hat versucht, auf /admin zuzugreifen.',
    ip:          req.session.ip
  });

  res.status(403);
  res.render('errors/403', {});
};

helpers.userData = function(req) {
  var loggedIn = req.hasOwnProperty('user'),
      user = {};

  if (loggedIn) {
    user = JSON.parse(JSON.stringify(req.user));
    user.loggedIn = true;
    user.name = req.user.firstName + ' ' + req.user.lastName;
    user.isAdmin = (req.user.admin);
  }

  return user;
};
