'use strict';

/*
 global module,
 require
 */

var Invoice = require('../invoice');

var statistics = module.exports = {};

statistics.overview = function (req, res, next) {
  var vars = {
    pageTitle: 'Statistik'
  };

  res.render('statistics/overview', vars);
};
