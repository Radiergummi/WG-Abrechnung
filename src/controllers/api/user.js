'use strict';

var fs        = require('fs'),
    nconf     = require('nconf'),

    userModel = require('../../models/user'),
    ObjectId  = require('mongoose').Types.ObjectId;

var userApi = module.exports = {};

userApi.savePicture = function(req, res, next) {
  fs.writeFile(nconf.get('path') + '/public/images/users/' + req.body.user + '.jpg', req.file.buffer, function(error) {
    if (error) {
      return next(error);
    }

    return res.status(204).send({});
  });
};
