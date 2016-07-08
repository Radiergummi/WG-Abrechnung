'use strict';

/*
 global module,
 require
 */

var userSockets = module.exports = {};

userSockets.getOwnId = function(socket, data, callback) {
  return callback(null, socket._id);
};

