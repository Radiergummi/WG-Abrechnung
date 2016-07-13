'use strict';
var fs = require('fs'),
    nconf = require('nconf');

var helper  = require('./helpers');

var api = module.exports = {};

api.saveProfilePicture = function(req, res, next) {
  fs.writeFile(nconf.get('path') + '/public/images/users/' + req.body.user + '.jpg', req.file.buffer,function(error) {
    if (error) {
      return next(error);
    }

    return res.status(200).send({
      response: 'the image has been saved'
    });
  });
};

