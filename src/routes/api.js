'use strict';

/*
 global module,
 require
 */

var nconf  = require('nconf'),
    multer = require('multer'),
    /*
    storage = multer.diskStorage({
      destination: function(req, file, callback) {
        console.log('destination');
        return callback(null, nconf.get('path') + '/public/images/users');
      },
      filename: function(req, file, callback) {
        console.log('filename', req.body);
        return callback(null, req.body.user + '.jpg')
      }
    }),
    */
    storage = multer.memoryStorage(),
    upload = multer({
      storage: storage,
      fileFilter: function(req, file, callback) {
        console.log('fileFilter');
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
