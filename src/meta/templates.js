var debug     = require('debug')('flatm8:meta:templates'),
    fs        = require('fs'),
    mkdirp    = require('mkdirp'),
    nconf     = require('nconf'),
    path      = require('path'),
    rimraf    = require('rmfr'),
    winston   = require('winston'),

    Templates = module.exports = {};

Templates.compile = function() {
  var publicTemplatesPath = path.join(nconf.get('path'), 'public/templates'), // path to templates
      viewsPath           = path.join(nconf.get('path'), 'src/views');//, // path to views

  debug('view input path set to %s', viewsPath);
  debug('template output path set to %s', publicTemplatesPath);

  /**
   * retrieves all templates recursively
   *
   * @param {string} directory  the template folder
   * @param {string} publicTemplatesPath
   * @param {string} viewsPath
   * @returns {Promise}
   */
  function getTemplates (directory, publicTemplatesPath, viewsPath) {

    // create a promise to start from
    var innerTemplatePromise = new Promise(function(resolve, reject) {

      debug('iterating over view directory %s', path.join(viewsPath, directory));

      // read the template directory
      return fs.readdir(path.join(viewsPath, directory), function(error, files) {
        if (error) {
          winston.error('could not read view folder %s: %s', directory, error.message);
          return reject(error);
        }

        debug('processing %s templates in %s', files.length, path.join(viewsPath, directory));

        // append the base path to all templates
        return resolve(files);
      });
    });

    innerTemplatePromise.then(function(files) {
      return new Promise(function(resolve, reject) {
        var templateDirectory = path.join(publicTemplatesPath, directory);

        return mkdirp(templateDirectory, function(error) {
          if (error) {
            debug('could not create template directory %s: $s', templateDirectory, error.message);
            return reject(error);
          }

          debug('created template directory %s', templateDirectory);
          return resolve(files);
        });
      });
    });


    innerTemplatePromise.then(function(files) {
      var fileSequence = Promise.resolve();

      debug('iterating over %s templates', files.length);

      // iterate over the files in the template folder
      files.forEach(function(file) {
        var filePath = path.join(viewsPath, directory, file);

        debug('current file %s at %s', file, filePath);

        fileSequence = fileSequence.then(function() {

          // retrieve statistics for the current file
          fs.lstat(filePath, function(error, stats) {
            if (error) {
              debug('could not gather stats for %s: %s', filePath, error.message);

              return Promise.reject(error);
            }

            debug('gathered stats for %s', filePath);

            // if the file is actually a folder, run getTemplates on it
            if (stats.isDirectory()) {
              var currentDirectory = filePath.slice(viewsPath.length);

              debug('processing template directory %s (path: %s)', file, currentDirectory);
              fileSequence.then(function() {
                debug('running getTemplates on %s', currentDirectory);

                return getTemplates(currentDirectory, publicTemplatesPath, viewsPath);
              });
            } else {
              var currentFile = filePath.slice(viewsPath.length);

              debug('processing template file %s (path: %s)', file, currentFile);

              importPartials(currentFile, publicTemplatesPath, viewsPath);
            }
          });
        });
      });

      return resolve(fileSequence);
    });

    return innerTemplatePromise;
  }


  function importPartials (template, templatesPath, viewsPath) {
    var file    = fs.readFileSync(path.join(viewsPath, template)).toString(),
        matches = null,
        regex   = /[ \t]*<!-- IMPORT ([\s\S]*?)? -->[ \t]*/;

    debug('importing partials for %s', template);

    while ((matches = file.match(regex)) !== null) {
      var partial = path.join(viewsPath, matches[ 1 ]);

      debug('found partial import for %s in %s', matches[ 1 ], template);

      try {
        file = file.replace(regex, fs.readFileSync(partial).toString());
        debug('imported partial %s into %s', matches[ 1 ], template);
      } catch (error) {
        winston.warn('Partial not loaded: %s (searching at %s)', matches[ 1 ], partial);
        debug('received fs error while importing partial %s into %s: %s', matches[ 1 ], template, error.message);
        file = file.replace(regex, '');
      }
    }

    debug('writing template %s to %s', template, path.join(templatesPath, template));
    fs.writeFileSync(path.join(templatesPath, template), file);
  }

  /**
   * delete the public template path
   */
  return rimraf(publicTemplatesPath)

  /**
   * start processing templates
   */
    .then(function() {
      return getTemplates('', publicTemplatesPath, viewsPath)
    })

    //catch any errors
    .catch(function(error) {
      console.error('error in templates: %s', error.message, error);
    });
};
