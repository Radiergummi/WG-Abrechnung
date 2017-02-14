'use strict';

const debug     = require('debug')('flatm8:controllers:api:user'),
      nconf     = require('nconf'),
      path      = require('path'),
      sharp     = require('sharp'),
      file      = require('../../meta/file'),

      userModel = require('../../models/user'),
      ObjectId  = require('mongoose').Types.ObjectId;

const userApi = module.exports = {};

/**
 * retrieves the current profile picture of a user
 *
 * @param req
 * @param res
 * @param next
 */
userApi.getPicture = function(req, res, next) {
  debug('requested user picture for %s', req.user._id);
  var userPicturePath    = path.join(nconf.get('path'), '/public/images/users/' + req.user._id + '.jpg'),
      defaultPicturePath = path.join(nconf.get('path'), '/public/images/users/default.jpg');

  file.exists(userPicturePath, function(exists) {
    if (!exists) {
      debug('could not find user picture for %s', req.user._id);
      return res.sendFile(defaultPicturePath);
    }

    return res.sendFile(userPicturePath);
  });
};

/**
 * receives a new profile picture for a user
 *
 * @param req
 * @param res
 * @param next
 */
userApi.savePicture = function(req, res, next) {
  debug('requested user picture change for %s', req.user._id);

  const profilePicture = sharp(req.file.buffer),
        profilePictureThumbnail = profilePicture.clone();

  profilePictureThumbnail
    .jpeg({
      quality: 100
    })
    .resize(200, 200)
    .blur(50)
    .toFile(path.join(nconf.get('path'), '/public/images/users', req.user._id + '_preview.jpg'))
    .then(info => debug('wrote thumbnail:', info), error => debug('error writing thumbnail:', error));

  profilePicture
    .jpeg({
      quality: 80
    })
    .resize(400, 400)
    .toFile(path.join(nconf.get('path'), '/public/images/users', req.user._id + '.jpg'))
    .then(info => {
      return res.status(204).send({});
    }, error => debug('error writing profile picture:', error));

  /*
   return new Promise((resolve, reject) => {
   file.write('/public/images/users/' + req.user._id + '.jpg', req.file.buffer, function(error) {
   if (error) {
   debug('could not write picture: %s', error.message);
   return reject(error);
   }

   debug('wrote picture successfully');
   return resolve(req.file.buffer);
   });
   });*/
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
        status:  500,
        reason:  'db-error',
        message: {
          raw:         'could not fetch user configuration data: ' + error.message,
          translation: '[[global:server_error]]'
        }
      });
    }

    config.language               = data.language || nconf.get('language');
    config.user                   = JSON.parse(JSON.stringify(data));
    config.user.hasProfilePicture = file.existsSync('public/images/users/' + req.user._id + '.jpg');

    return res.json(config);
  });

};
