'use strict';

/*
 global module,
 require
 */

var Invoice = require('../invoice');

var statistics = module.exports = {};

statistics.overview = function(req, res, next) {
  var vars = {
    pageTitle: 'Statistiken - Übersicht',
    statisticsActive: true
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
        pageTitle:   'Statistik - ' + months[ req.params.month ],
        statisticsActive: true,
        month:       req.params.month,
        monthName:   months[ req.params.month ],
        monthNumber: Object.keys(months).indexOf(req.params.month) + 1
      };

  if (!months[ req.params.month ]) {
     next('not found')
  }

  res.render('statistics/month', vars);
};

