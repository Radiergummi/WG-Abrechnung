'use strict';

/*
 global module,
 require
 */

var webpack     = require('webpack'),
    path        = require('path'),
    Javascripts = module.exports = {};

/**
 * compiles the public javascript files
 *
 * @param {object} config
 * @returns {Promise}
 */
Javascripts.compile = function (config) {

  var sourcePath     = path.join(config.basePath, 'public', 'javascripts', 'src'),
      deploymentPath = path.join(config.basePath, 'public', 'javascripts'),
      deploymentUri  = '/javascripts/',
      debug          = config.debug;

// load all required webpack plugins
  var compilerPlugins = [

    // move common code into base scripts
    new webpack.optimize.CommonsChunkPlugin((debug ? 'base.js' : 'base.min.js'))
  ];

// enable minification in production
  if (! debug) {
    compilerPlugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }));
  }

  /**
   * create the webpack instance
   */
  var compiler = webpack({
    debug: debug,

    /**
     * the public javascript path
     */
    context: sourcePath,

    /**
     * the app entry points. That'll be scripts for individual pages
     */
    entry:  {
      'dashboard':        './dashboard.js',
      'invoices.all':     './invoices.all.js',
      'invoices.create':  './invoices.create.js',
      'invoices.search':  './invoices.search.js',
      'registration':     './registration.js',
      'settings':         './settings.js',
      'statistics.all':   './statistics.all.js',
      'statistics.month': './statistics.month.js'
    },
    output: {
      path:              deploymentPath,
      publicPath:        deploymentUri,
      filename:          (debug
          ? '[name].js'
          : '[name].min.js'
                         ),
      sourceMapFilename: (debug
          ? '[name].map'
          : '[name].min.map'
                         )
    },

    // enable caching
    cache: true,

    // render source maps only in development
    devtool: (debug ? 'source-map' : false),
    plugins: compilerPlugins,
    module:  {
      loaders: [

        /**
         * ignore translation JSON files
         */
        { test: /\/translations\/.{2,5}\.json$/, loader: 'ignore-loader' }
      ]
    }
  });

  return new Promise(function (resolve, reject) {
    compiler.run(function (error, stats) {
      if (error) {
        return reject(error);
      }

      if (stats.hasErrors()) {
        process.send({
          type: 'error',
          message: stats.error
        });
      }

      if (stats.hasWarnings()) {
        process.send({
          type: 'error',
          message: stats.warning
        });
      }

      if (debug) {
        process.send({
          type: 'info',
          message: stats.toString({ colors: true })
        });
      }


      process.send({
        type: 'info',
        message: 'Successfully compiled JS'
      });

      return resolve();
    });
  })
};
