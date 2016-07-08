'use strict';

/*
 global module,
 require
 */

var file = require('../meta/file');

var appSockets = module.exports = {};

appSockets.getConfig = function(socket, callback) {
  var config = {
    user: {
      id:                socket._id,
      hasProfilePicture: file.existsSync('public/images/users/' + socket._id + '.jpg')
    }
  };

  return callback(null, config);
};

