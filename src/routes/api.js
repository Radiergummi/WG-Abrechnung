'use strict';

/*
 global module,
 require
 */

var nconf  = require('nconf'),
    multer = require('multer'),
    storage = multer.diskStorage({
      destination: function(req, file, callback) {
        return callback(nconf.get('path') + '/public/images/users');
      },
      filename: function(req, file, callback) {
        return callback(null, req.user.id + '.jpg')
      }
    }),
    upload = multer({
      storage: storage,
      fileFilter: function(req, file, callback) {
        if (file.mimetype.match('image\/jp(e)?g')) {
          return callback(null, true);
        }

        return callback(null, false);
      }
    });

var helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  router.post('/api/user/picture/upload', upload.single('profilePicture'), controllers.saveProfilePicture);
};
