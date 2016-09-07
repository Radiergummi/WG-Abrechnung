'use strict';

var file        = require('../../meta/file'),
    nconf     = require('nconf'),

    userModel = require('../../models/user'),
    ObjectId  = require('mongoose').Types.ObjectId;

var userApi = module.exports = {};

userApi.savePicture = function(req, res, next) {
  file.write('/public/images/users/' + req.body.user + '.jpg', req.file.buffer, function(error) {
    if (error) {
      return next(error);
    }

    return res.status(204).send({});
  });
};

userApi.getConfig = function(req, res, next) {
  var config = {
    debug: (nconf.get('environment') === 'development')
  };

  if (!req.user) {
    config.language = nconf.get('language');
    config.user     = {};

    return res.json(config);
  }

  userModel.findOne({ _id: req.user._id }, function(error, data) {
    if (error) {
      return res.status(500).json({
        status: 500,
        reason: 'db-error',
        message: {
          raw: 'could not fetch user configuration data: ' + error.message,
          translation: '[[global:server_error]]'
        }
      });
    }

    config.language               = data.language || nconf.get('language');
    config.user                   = JSON.parse(JSON.stringify(data));
    config.user.hasProfilePicture = file.existsSync('public/images/users/' + socket._id + '.jpg');

    return res.json(config);
  });

};
