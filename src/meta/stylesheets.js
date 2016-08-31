'use strict';

/*
 global module,
 require
 */

var gulp       = require('gulp'),
    scss       = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps'),
    nconf      = require('nconf'),
    path       = require('path'),
    basePath   = nconf.get('path'),
    debug      = (nconf.get('environment') === 'development'),
    scssConfig = {
      outputStyle:    (debug ? 'expanded' : 'compressed'),
      precision:      3,
      sourceComments: debug,
      indentWidth:    2,
      indentType:     'space'
    };

var Stylesheets = module.exports = {
  sourcePath:     path.join(basePath, 'public', 'scss'),
  deploymentPath: path.join(basePath, 'public', 'stylesheets')
};

/**
 * compiles and minifies SCSS
 *
 * @returns {Promise}
 */
Stylesheets.compile = function () {
  return new Promise(function (resolve, reject) {

    /**
     * read all SCSS files
     */
    var gulpStream = gulp.src([
      path.join(Stylesheets.sourcePath, '*.scss')
    ])

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
      .pipe(gulp.dest(Stylesheets.deploymentPath));

    return resolve(gulpStream);
  });
};
