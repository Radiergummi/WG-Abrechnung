'use strict';

var app  = require('./app'),
    main = require('./main')(app);

(function(app) {
  app.startup.push(function() {
    app.elements.verifyTokenButton = document.getElementById('verify-token');
    app.elements.token             = document.getElementById('invitation-token');

    app.listeners.addTokenVerificationEvents = function() {
      if (app.elements.verifyTokenButton) {
        app.on('click', app.elements.verifyTokenButton, app.events.appendTokenToUrl);
      }
    };

    app.events.appendTokenToUrl = function(event) {
      if (!app.elements.token.value) {
        app.notifications.warning('[[clientErrors:empty_token_input]]');
      }

      return window.location.href = window.location.origin + window.location.pathname.replace(/\/?$/, '/') + app.elements.token.value + window.location.search;
    };

    app.listeners.addTokenVerificationEvents();
  });
})(app);
