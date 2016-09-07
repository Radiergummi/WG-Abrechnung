'use strict';

/*
 global module,
 require
 */

var gulp       = require('gulp'),
    changed    = require('gulp-changed'),
    debug      = require('gulp-debug'),
    scss       = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps'),
    path       = require('path');

var Stylesheets = module.exports = {};

/**
 * compiles and minifies SCSS
 *
 * @param {object} config
 * @returns {Promise}
 */
Stylesheets.compile = function(config) {
  var sourcePath     = path.join(config.basePath, 'public', 'stylesheets', 'src'),
      deploymentPath = path.join(config.basePath, 'public', 'stylesheets'),
      scssConfig     = {
        outputStyle:    (config.debug ? 'expanded' : 'compressed'),
        precision:      3,
        sourceComments: config.debug,
        indentWidth:    2,
        indentType:     'space'
      };

  return new Promise(function(resolve, reject) {

    if (config.debug) {
      process.send({
        type:    'info',
        message: 'Compiling SCSS files in ' + sourcePath + ', deploying to ' + deploymentPath
      });
    }

    /**
     * read all SCSS files
     */
    var gulpStream = gulp.src([
      path.join(sourcePath, '*.scss')
    ]);

    if (config.debug) {
      gulpStream.pipe(debug({
        minimal: false
      }));
    }

    /**
     * filter unchanged files
     */
    gulpStream.pipe(changed(deploymentPath))

    /**
     * initialize source maps
     */
      .pipe(sourceMaps.init())


      /**
       * compile SCSS
       */
      .pipe(scss(scssConfig).on('error', function(error) {
        console.log(error);
        reject(error);
      }))

      /**
       * write the source map
       */
      .pipe(sourceMaps.write('./'))

      /**
       * write the CSS file
       */
      .pipe(gulp.dest(deploymentPath));

    if (config.debug) {
      gulpStream.pipe(debug({
        minimal: false
      }));
    }

    process.send({
      type:    'info',
      message: 'Successfully compiled SCSS'
    });

    return resolve(gulpStream);
  });
};
