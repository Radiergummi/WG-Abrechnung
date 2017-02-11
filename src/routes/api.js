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
  router.post('/api/user/picture',
    middleware.checkAuth,
    middleware.upload.single('profilePicture'),
//  middleware.csrf,
    controllers.user.savePicture
  );

  // Invoices
  router.get('/api/invoices', middleware.checkAuth, controllers.invoices.getInvoices);
  router.get('/api/invoices/:id', middleware.checkAuth, controllers.invoices.getInvoice);
  router.put('/api/invoices/:id',
    middleware.checkAuth,
    middleware.upload.single('invoicePicture'),
    middleware.csrf,
    controllers.invoices.editInvoice
  );

  router.post('/api/invoices',
    middleware.checkAuth,
    middleware.upload.single('invoicePicture'),
    middleware.csrf,
    controllers.invoices.createInvoice
  );

  // Users
  router.get('/api/users', middleware.checkAuth, controllers.users.getUsers);
  router.get('/api/users/:id', middleware.checkAuth, controllers.users.getUser);
  router.put('/api/users/:id', middleware.checkAuth, /*middleware.csrf, */controllers.users.editUser);
};
