'use strict';

/*
 global module,
 require
 */

var controllers = require('./main');
controllers.helpers = require('./helpers');
controllers.dashboard = require('./dashboard');
controllers.invoices = require('./invoices');
controllers.statistics = require('./statistics');
controllers.authentication = require('./authentication');
controllers.api = require('./api');

module.exports = controllers;
