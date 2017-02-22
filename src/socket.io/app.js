'use strict';

/*
 global module,
 require
 */

const handlebars = require('handlebars'),
      nconf      = require('nconf');

const file = require('../meta/file'),
      User = require('../user');

const appSockets = module.exports = {};

/**
 * retrieves the app config
 *
 * @param   {object} socket
 * @param   {function} callback
 * @returns {null|error|object}
 */
appSockets.getConfig = function(socket, callback) {
  let config = {
    debug: (nconf.get('environment') === 'development')
  };

  if (socket._id === 0) {
    config.language = nconf.get('language');
    config.user     = {};

    return callback(null, config);
  }

  User.getById(socket._id, function(error, data) {
    if (error) {
      return callback(error);
    }

    config.language               = data.language || nconf.get('language');
    config.user                   = JSON.parse(JSON.stringify(data));
    config.user.hasProfilePicture = file.existsSync('public/images/users/' + socket._id + '.jpg');

    return callback(null, config);
  });
};

/**
 * returns a template which is optionally parsed
 *
 * @param {object}   socket
 * @param {object}   data
 * @param {string}   data.template
 * @param {object}   data.templateVariables
 * @param {boolean}  [data.skipParse]
 * @param {function} callback
 * @returns
 */
appSockets.getTemplate = function(socket, data, callback) {
  data.skipParse = data.skipParse || false;

  return file.read('public/templates/' + data.template, function(error, content) {
    if (error) {
      return callback(error);
    }

    let template = handlebars.compile(content);

    if (!data.skipParse) {
      return template.render(data.templateVariables);
    }

    return content;
  });
};

appSockets.sendTestMail = function(socket, data, callback) {
  var mailer = require('../mailer'),
      months = [
        '',
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November'
      ];

  mailer.send('emails/monthlyCalculation', {
    url:                   nconf.get('url'),
    subject:               'Monatsabrechnung',
    month:                 months[ new Date().getMonth ],
    ownSpendingSum:        123.45,
    ownSpendingPercentage: 76,
    debts:                 [
      {
        user:    'Ferdl',
        debtSum: 28.99,
        youOwe:  true,
        theyOwe: false
      },
      {
        user:    'Test',
        debtSum: 58.12,
        youOwe:  false,
        theyOwe: true
      }
    ]
  }, socket._id, function(error, data) {
    if (error) {
      callback(error);
    }

    callback(error, data);
  });
};
