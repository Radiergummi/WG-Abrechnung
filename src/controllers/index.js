'use strict';

/*
 global module,
 require
 */

var controllers = require('./main');
controllers.helpers = require('./helpers');
controllers.dashboard = require('./dashboard');
controllers.authentication = require('./authentication');
controllers.api = require('./api');

module.exports = controllers;
