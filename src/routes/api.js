'use strict';

/*
 global module,
 require
 */

var nconf   = require('nconf'),
    multer  = require('multer'),
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
    upload  = multer({
      storage:    storage,
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
  router.get('/api', controllers.listEndpoints);

  router.post('/api/user/picture/upload', middleware.checkAuth, upload.single('profilePicture'), controllers.user.savePicture);
  router.post('/api/invoices/create', middleware.checkAuth, upload.single('invoicePicture'), controllers.createNewInvoice);

  // Invoices
  router.get('/api/invoices', middleware.checkAuth, controllers.invoices.getInvoices);
  router.get('/api/invoices/:id', middleware.checkAuth, controllers.invoices.getInvoice);

  // Users
  router.get('/api/users', middleware.checkAuth, controllers.users.getUsers);
  router.get('/api/users/:id', middleware.checkAuth, controllers.users.getUser);
};
