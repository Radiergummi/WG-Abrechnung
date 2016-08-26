'use strict';

/*
 global module,
 require
 */

var webpack     = require('webpack'),
    nconf       = require('nconf'),
    path        = require('path'),
    winston     = require('winston'),
    Javascripts = module.exports = {},
    environment = nconf.get('environment');

Javascripts.deploymentPath = path.join(nconf.get('path'), nconf.get('assets:js'));
Javascripts.deploymentUri  = '/javascripts/';

var compiler = webpack({
  context: Javascripts.deploymentPath,
  entry:   './app',
  output:  {
    path:       Javascripts.deploymentPath,
    publicPath: Javascripts.deploymentUri,
    filename:   (environment === 'production'
        ? 'bundle.min.js'
        : 'bundle.js'
                )
  },
  plugins: (environment === 'production' ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : [])
});

Javascripts.compile = function() {
  return new Promise(function(resolve, reject) {
    compiler.run(function(error, stats) {
      if (error) {
        return reject(error);
      }

      if (stats.hasErrors()) {
        winston.error(stats.error);
      }

      if (stats.hasWarnings()) {
        winston.warn(stats.warnings);
      }

      if (nconf.get('environment') === 'development') {
        winston.info(stats.toString({ colors: true }));
      }

      return resolve(null);
    });
  })
};
