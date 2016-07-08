'use strict';

/*
 global module,
 require
 */

var Event   = require('../event'),
    file    = require('../meta/file'),

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
    user.id = req.user.id;
    user.name = req.user.firstName + ' ' + req.user.lastName;
    user.isAdmin = (req.user.admin);
    user.hasProfilePicture = file.existsSync('public/images/users/' + req.user.id + '.jpg');
  }

  return user;
};
