'use strict';

/*
 global module,
 require
 */

const gulp       = require('gulp'),
      changed    = require('gulp-changed'),
      debug      = require('gulp-debug'),
      scss       = require('gulp-sass'),
      sourceMaps = require('gulp-sourcemaps'),
      path       = require('path');

const Stylesheets = module.exports = {};

/**
 * compiles and minifies SCSS
 *
 * @param {object} config
 * @returns {Promise}
 */
Stylesheets.compile = function(config) {
  const sourcePath     = path.join(config.basePath, 'public', 'stylesheets', 'src'),
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
        module:  'stylesheets',
        type:    'info',
        message: 'Compiling SCSS files'
      });
    }

    gulp.task('compile', () => {
      /**
       * read all SCSS files
       */
      const gulpStream = gulp.src([
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
          process.send(error);
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
        module:   'stylesheets',
        type:     'info',
        message:  'Successfully compiled SCSS',
        finished: true
      });

      return resolve(gulpStream);
    });

    gulp.task('watch', () => {
      const watcher = gulp.watch(path.join(sourcePath, '**/*.scss'), [ 'compile' ]);
      watcher.on('change', event => process.send({
        module:  'stylesheets',
        type:    'info',
        message: `File ${event.path} was ${event.type}`
      }));
    });

    if (config.debug) {
      gulp.start('watch');

      process.send({
        module:  'stylesheets',
        type:    'info',
        message: `Watching ${sourcePath} for changes`
      });
    } else {
      gulp.start('compile');
    }
  });
};
