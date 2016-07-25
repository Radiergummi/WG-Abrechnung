'use strict';

/*
 global module,
 require
 */

var Invoice = require('../invoice');

var statistics = module.exports = {};

statistics.overview = function(req, res, next) {
  var vars = {
    pageTitle: 'Statistiken - Übersicht'
  };

  res.render('statistics/overview', vars);
};

statistics.month = function(req, res, next) {
  var months = {
        'january':   'Januar',
        'february':  'Februar',
        'march':     'März',
        'april':     'April',
        'may':       'Mai',
        'june':      'Juni',
        'july':      'Juli',
        'august':    'August',
        'september': 'September',
        'october':   'Oktober',
        'november':  'November',
        'december':  'Dezember'
      },
      vars   = {
        pageTitle: 'Statistik - ' + months[ req.params.month ],
        month: req.params.month,
        monthName: months[ req.params.month ]
      };

  res.render('statistics/month', vars);
};

