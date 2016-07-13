'use strict';

/*
 global module,
 require
 */

var templates = require('templates.js');

var file = require('../meta/file');

var appSockets = module.exports = {};

/**
 * retrieves the app config
 *
 * @param   {object} socket
 * @param   {function} callback
 * @returns {null|error|object}
 */
appSockets.getConfig = function (socket, callback) {
  var config = {
    user: {
      id:                socket._id,
      hasProfilePicture: file.existsSync('public/images/users/' + socket._id + '.jpg')
    }
  };

  return callback(null, config);
};

/**
 * returns a template which is optionally parsed
 *
 * @param {object}   socket
 * @param {object}   data
 * @param {string}   data.template
 * @param {object}   data.templateVariables
 * @param {boolean}  [data.skipParse]
 * @param {function} callback
 * @returns
 */
appSockets.getTemplate = function (socket, data, callback) {
  data.skipParse = data.skipParse || false;

  return file.read('public/templates/' + data.template, function (error, content) {
    if (error) {
      return callback(error);
    }

    if (! data.skipParse) {
      return templates.parse(content, data.templateVariables);
    }

    return content;
  });
};
