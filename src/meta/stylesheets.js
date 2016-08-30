'use strict';

/*
 global module,
 require
 */

var gulp     = require('gulp'),
    scss     = require('gulp-scss'),
    nconf    = require('nconf'),
    path     = require('path'),
    basePath = nconf.get('path');

var Stylesheets = module.exports = {
  sourcePath:     path.join(basePath, 'public', 'scss'),
  deploymentPath: path.join(basePath, 'public', 'css')
};

Stylesheets.compile = function () {
  return new Promise(function (resolve, reject) {
    var gulpStream = gulp.src([
      path.join(Stylesheets.sourcePath, '*.scss')
    ])
      .pipe(scss().on('error', function (error) {
        reject(error);
      }))
      .pipe(gulp.dest(Stylesheets.deploymentPath));

    return resolve(gulpStream);
  });
};
