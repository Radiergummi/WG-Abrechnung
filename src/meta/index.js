'use strict';

/*
 global module,
 require
 */

const stylesheets = require('./stylesheets'),
      javascripts = require('./javascripts');

function compile (config) {
  function messenger (error, results) {
    if (!!error) {
      return process.send({
        type:    'error',
        message: JSON.stringify(error),
        results: results
      });
    }

    return process.send({
      module:  'assets',
      type:    'info',
      message: 'All assets were successfully compiled',
      results: results
    });
  }

  process.send({
    module:  'assets',
    type:    'info',
    message: 'Starting to compile assets'
  });

  return Promise.all([
    stylesheets.compile(config),
    javascripts.compile(config)
  ]).then(function(results) {
    return messenger(null, results);
  }).catch((error) => {
    return messenger(error);
  });
}

process.on('message', function(event) {
  if (event.action === 'compile.all') {
    return compile(event.config);
  }
});
