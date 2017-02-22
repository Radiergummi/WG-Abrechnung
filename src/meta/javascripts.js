'use strict';

/*
 global module,
 require
 */

const webpack        = require('webpack'),
      ProgressPlugin = require('webpack/lib/ProgressPlugin'),
      path           = require('path'),
      Javascripts    = module.exports = {};

/**
 * compiles the public javascript files
 *
 * @param {object} config
 * @returns {Promise}
 */
Javascripts.compile = function(config) {
  let sourcePath     = path.join(config.basePath, 'public', 'javascripts', 'src'),
      deploymentPath = path.join(config.basePath, 'public', 'javascripts'),
      deploymentUri  = '/javascripts/',
      debug          = config.debug;

  // load all required webpack plugins
  let compilerPlugins = [

    // move common code into base scripts
    new webpack.optimize.CommonsChunkPlugin('base')
  ];

// enable minification in production
  if (!debug) {
    compilerPlugins.push(new webpack.optimize.UglifyJsPlugin({
      compress:  {
        warnings: false
      },
      sourceMap: true
    }));
  }

  const webpackConfig = {

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
      'invoices.edit':    './invoices.edit.js',
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
                         ),
    },

    // enable watching in debug mode
    watch: debug,

    watchOptions: {
      ignored: /node_modules/,
      poll:    1000
    },

    // enable caching
    cache: true,

    // render source maps only in development
    devtool: (debug ? 'source-map' : false),
    plugins: compilerPlugins,
    module:  {
      rules: [

        /**
         * ignore translation JSON files
         */
        {
          test:   /\/translations\/.{2,5}\.json$/,
          loader: 'ignore-loader'
        }
      ]
    },
    resolve: {
      alias: {
        handlebars:   'handlebars/dist/handlebars.js',
        'vex-js':     'vex-js/src/vex.js',
        'vex-dialog': 'vex-dialog/src/vex.dialog.js'
      }
    }
  };

  /**
   * create the webpack instance
   */
  const compiler = webpack(webpackConfig);

  return new Promise(function(resolve, reject) {
    let lastProgressValue = 0,
        rateLimit         = (debug ? 1 : 5),
        progressHandler   = new ProgressPlugin((percentage, message) => {
          let progress = Math.round(percentage * 100);

          // if current percentage is divisible by rateLimit and the number is
          // different than the previous one
          if (progress % rateLimit === 0 && progress !== lastProgressValue) {
            process.send({
              module:  'javascripts',
              type:    'info',
              message: `${progress}% - ${message}`
            });

            lastProgressValue = progress;
          }
        });

    // add the progress handler
    compiler.apply(progressHandler);

    /**
     * runs after compilation has finished
     *
     * @param   {Error}  error
     * @param   {object} stats
     * @returns {*}
     */
    const compilerCallback = function(error, stats) {
      if (error) {
        process.send({
          module:  'javascripts',
          type:    'error',
          message: JSON.stringify(error)
        });

        return reject(error);
      }

      const statistics = stats.toJson();

      if (statistics.errors.length > 0) {
        statistics.errors.forEach(error => {
          let message = error.replace(
            /(?:.+) from (.+)[\n\r](.*) \[\.\/(.*?):(\d+),(?:\d+)\]\[(.*?):(\d+),(?:\d+)\]/gmi,
            '$1 error in $3 (line $4): $2'
          );

          process.send({
            module:  'javascripts',
            type:    'error',
            message: message
          });
        });
      }

      if (statistics.warnings.length > 0) {
        process.send({
          module:   'javascripts',
          type:     'error',
          message:  statistics.warnings,
          finished: true
        });
      }

      if (debug) {
        process.send({
          module:   'javascripts',
          type:     'info',
          message:  stats.toString({ colors: true }),
          finished: true
        });
      }

      process.send({
        module:   'javascripts',
        type:     'info',
        message:  'Successfully compiled JS',
        finished: true
      });

      return resolve();
    };

    if (debug) {
      return compiler.watch({}, compilerCallback);
    } else {
      return compiler.run(compilerCallback);
    }
  })
};
