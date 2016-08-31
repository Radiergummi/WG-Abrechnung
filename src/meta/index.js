'use strict';

/*
 global module,
 require
 */

function compile(config) {
  var templates   = require('./templates'),
      stylesheets = require('./stylesheets'),
      javascripts = require('./javascripts');

  function messenger(error, results) {
    if (error) {
      return process.send({
        type:    'error',
        message: error.message,
        results: results
      });
    }

    return process.send({
      type:    'info',
      message: 'assets were successfully compiled',
      results: results
    });
  }

  return Promise.all([
    templates.compile(config),
    stylesheets.compile(config),
    javascripts.compile(config)
  ]).then(function (results) {
    return messenger(null, results);
  }).catch(messenger);
}

process.on('message', function(event) {
  if (event.action === 'compile.all') {
    return compile(event.config);
  }
});
