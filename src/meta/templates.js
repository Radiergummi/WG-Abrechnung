const debug     = require('debug')('flatm8:meta:templates'),
      fs        = require('fs'),
      fileHound = require('filehound'),
      mkdirp    = require('mkdirp'),
      path      = require('path'),
      rimraf    = require('rmfr'),

      // Templates = module.exports = {};
      Templates = {},
      T         = module.exports = {};

T.compile = function(config) {
  const publicTemplatesPath = path.join(config.basePath, 'public', 'templates'), // path to templates
        viewsPath           = path.join(config.basePath, 'src', 'views'); // path to views

  debug('view input path set to %s', viewsPath);
  debug('template output path set to %s', publicTemplatesPath);

  const views = fileHound.create()
    .paths(path.join(viewsPath))
    .ext('tpl')
    .find();

  views.then((files) => {
    console.log(files);
  });
};

/**
 *
 * @param {object} config
 * @returns {Promise}
 */
Templates.compile = function(config) {
  var publicTemplatesPath = path.join(config.basePath, 'public', 'templates'), // path to templates
      viewsPath           = path.join(config.basePath, 'src', 'views'); // path to views

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
          process.send({
            type:    'error',
            message: 'could not read view folder ' + directory + ': ' + error.message
          });

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
      }
      catch (error) {
        process.send({
          type:    'warn',
          message: 'Partial not loaded: ' + matches[ 1 ] + ' (searching at ' + partial + ')'
        });

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
    }).then(function() {
      process.send({
        type:    'info',
        message: 'Successfully compiled templates'
      });
    })

    //catch any errors
    .catch(function(error) {
      process.send({
        type:    'error',
        message: 'error in templates: ' + error.message
      });
    });
};
