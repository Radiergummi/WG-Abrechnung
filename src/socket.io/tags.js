'use strict';

/*
 global module,
 require
 */

const Tag        = require('../tag'),
      tagSockets = module.exports = {};

/**
 * retrieves the color of a tag
 *
 * @param   {object}   socket       the socket for the request
 * @param   {object}   data         the data transmitted by the client
 * @param   {string}   data.tagName the tags name
 * @param   {function} callback     the callback to execute
 * @returns {*}
 */
tagSockets.getColor = function(socket, data, callback) {
  return Tag.getByName(data.tagName, (error, tag) => {
    if (error) {
      return callback(error);
    }

    if (! tag) {
      return callback(null, 'blue');
    }

    return callback(null, tag.color);
  });
};

tagSockets.create = function(socket, data, callback) {
  return Tag.createNew({
    tagName:  data.tagName,
    tagColor: data.tagColor
  }, (error, newTag) => {
    if (error) {
      return callback(error);
    }

    return callback(null, newTag);
  });
};
