'use strict';

/*
 global module,
 require
 */

var async = require('async'),
    passport = require('passport'),
    validator = require('validator'),
    _ = require('underscore'),
    winston = require('winston'),
    db = require('../database');

var User = require('../user'),
    Event = require('../event'),
    auth = require('../authentication');


var authentication = module.exports = {};


authentication.logout = function (req, res, next) {
  Event.push('user:logged-out', req.user.firstName + ' ' + req.user.lastName, 'authentication', {
    description: 'hat sich abgemeldet',
    ip: req.session.ip
  });

  if (req.user && req.user.id !== 0 && req.sessionID) {
    var id = req.user.id;
    req.session.destroy();
    req.logout();
  }

  res.redirect('/login');
};

authentication.login = auth.login;
authentication.register = auth.register;
