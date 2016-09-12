'use strict';

/*
 global module,
 require
 */

var nconf          = require('nconf'),

    helper         = require('./helper'),
    setupPageRoute = helper.setupPageRoute;

module.exports = function(router, middleware, controllers) {
  router.get('/api', controllers.listEndpoints);

  router.get('/api/user/picture', controllers.user.getPicture);
  router.post(
    '/api/user/picture',
    middleware.checkAuth,
    middleware.upload.single('profilePicture'),
    middleware.csrf,
    controllers.user.savePicture
  );

  // Invoices
  router.get('/api/invoices', middleware.checkAuth, controllers.invoices.getInvoices);
  router.get('/api/invoices/:id', middleware.checkAuth, controllers.invoices.getInvoice);

  router.post(
    '/api/invoices',
    middleware.checkAuth,
    function(req,res,next) {console.log('still there'); return next()},
    middleware.upload.single('invoicePicture'),
    function(req, res, next) {
      console.log(req.body._csrf);

      return middleware.csrf(req, res, next);
    },
    //middleware.csrf,
    controllers.invoices.createInvoice
  );

  // Users
  router.get('/api/users', middleware.checkAuth, controllers.users.getUsers);
  router.get('/api/users/:id', middleware.checkAuth, controllers.users.getUser);
};
