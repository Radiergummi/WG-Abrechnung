webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app  = __webpack_require__(1),
	    main = __webpack_require__(10)(app);
	
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
	        return app.translate('[[clientErrors:empty_token_input]]', function(translated) {
	          app.notifications.warning(translated);
	        });
	      }
	
	      return window.location.href = window.location.origin + window.location.pathname.replace(/\/?$/, '/') + app.elements.token.value + window.location.search;
	    };
	
	
	    app.listeners.addTokenVerificationEvents();
	  });
	})(app);


/***/ }
]);
//# sourceMappingURL=registration.map