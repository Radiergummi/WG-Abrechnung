'use strict';

/*
 global module,
 require
 */

var gulp       = require('gulp'),
    changed    = require('gulp-changed'),
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
Stylesheets.compile = function (config) {
  var debug          = config.debug,
      sourcePath     = path.join(config.basePath, 'src'),
      deploymentPath = config.basePath,
      scssConfig     = {
        outputStyle:    (config.debug ? 'expanded' : 'compressed'),
        precision:      3,
        sourceComments: debug,
        indentWidth:    2,
        indentType:     'space'
      };

  return new Promise(function (resolve, reject) {

    /**
     * read all SCSS files
     */
    var gulpStream = gulp.src([
      path.join(sourcePath, '*.scss')
    ])

    /**
     * filter unchanged files
     */
      .pipe(changed(deploymentPath))

      /**
       * initialize source maps
       */
      .pipe(sourceMaps.init())

      /**
       * compile SCSS
       */
      .pipe(scss(scssConfig).on('error', function (error) {
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

    process.send({
      type: 'info',
      message: 'Successfully compiled SCSS'
    });

    return resolve(gulpStream);
  });
};
