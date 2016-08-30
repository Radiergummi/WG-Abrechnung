'use strict';

/*
 global module,
 require
 */

var webpack                    = require('webpack'),
    nconf                      = require('nconf'),
    path                       = require('path'),
    winston                    = require('winston'),
    Javascripts                = module.exports = {},
    debug = (nconf.get('environment') === 'development');

Javascripts.deploymentPath = path.join(nconf.get('path'), nconf.get('assets:js'));
Javascripts.deploymentUri  = '/javascripts/';

var compilerPlugins = [
  new webpack.optimize.CommonsChunkPlugin((debug ? 'base.js' : 'base.min.js'))
];

if (!debug) {
  compilerPlugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }));
}

var compiler = webpack({
  context: path.join(Javascripts.deploymentPath, 'src'),
  entry:   {
    'dashboard':        './dashboard.js',
    'invoices.all':     './invoices.all.js',
    'invoices.create':  './invoices.create.js',
    'invoices.search':  './invoices.search.js',
    'registration':     './registration.js',
    'settings':         './settings.js',
    'statistics.all':   './statistics.all.js',
    'statistics.month': './statistics.month.js'
  },
  output:  {
    path:              Javascripts.deploymentPath,
    publicPath:        Javascripts.deploymentUri,
    filename:          (debug
        ? '[name].js'
        : '[name].min.js'
                       ),
    sourceMapFilename: (debug
        ? '[name].map'
        : '[name].min.map'
                       )
  },
  cache:   true,
  debug:   debug,
  devtool: (debug ? 'source-map' : false),
  plugins: compilerPlugins,
  module: {
    loaders: [
      { test: /\/translations\/.{2,5}\.json$/, loader: 'ignore-loader' }
    ]
  }
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
