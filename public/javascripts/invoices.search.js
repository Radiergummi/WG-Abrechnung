webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app  = __webpack_require__(1),
	    main = __webpack_require__(69)(app);
	
	(function(app) {
	  
	  /**
	   * push the code into the app startup stack
	   */
	  app.startup.push(function() {
	
	      /**
	       * register all required elements
	       *
	       * searchInput:            the search input field
	       * searchSubmit:           the search submit button
	       * advancedSearchControls: the container for the advanced search control inputs
	       * searchResultsContainer: the container for search results
	       * searchResultList:       the list with search results
	       */
	      app.elements.searchInput = document.getElementById('search-input');
	      app.elements.searchSubmit                 = document.getElementById('submit-search');
	      app.elements.advancedSearchControls       = document.getElementById('advanced-search-controls');
	      app.elements.advancedSearchControlsToggle = document.getElementsByClassName('advanced-search-controls-toggle')[ 0 ];
	      app.elements.searchResultsContainer       = document.getElementsByClassName('search-results')[ 0 ];
	      app.elements.searchResultList             = app.elements.searchResultsContainer.getElementsByTagName('ul') [ 0 ];
	
	      /**
	       * Adds all invoice search page event listener to their targets
	       */
	      app.listeners.addInvoiceSearchEvents = function() {
	        app.elements.advancedSearchControlsToggle.addEventListener('click', app.events.toggleAdvancedSearchControls);
	        app.elements.searchInput.addEventListener('keydown', app.events.checkInputKeypress);
	        app.elements.searchSubmit.addEventListener('click', app.events.submitSearch);
	      };
	
	      app.events.checkInputKeypress = function(event) {
	        if (event.keyCode === 13) {
	          event.preventDefault();
	          app.elements.searchSubmit.click();
	        }
	      };
	
	      /**
	       * toggles search request submission
	       *
	       * @param {Event} event
	       */
	      app.events.submitSearch = function(event) {
	        var options = {}; // TODO: Parse advanced search options
	
	        event.target.classList.add('search-in-progress');
	        app.connectors.searchInvoice(app.elements.searchInput.value, options, function() {
	          event.target.classList.remove('search-in-progress');
	        });
	      };
	
	      /**
	       * toggles the display of the advanced search controls
	       *
	       * @param {Event} event
	       */
	      app.events.toggleAdvancedSearchControls = function(event) {
	        event.preventDefault();
	        event.target.classList.toggle('control-active');
	        app.elements.advancedSearchControls.classList.toggle('active');
	      };
	
	      /**
	       * emits a socket.io search request
	       *
	       * @param {string} query       the search query
	       * @param {object} options     search options to use for the request
	       * @param {function} callback  a callback to execute once the search request has been
	       *   processed
	       * @returns {*}
	       */
	      app.connectors.searchInvoice = function(query, options, callback) {
	        console.log('starting search for %s', query);
	        app.io.emit('invoices.search', {
	          query: query
	        }, function(error, data) {
	
	          /**
	           * push the search results page into history
	           */
	          history.pushState({
	            query:   query,
	            options: options
	          }, 'Suchergebnisse für ' + query, '/invoices/search/' + query);
	
	          if (error) {
	            console.error(error);
	
	            return callback();
	          }
	
	          var results = data.results;
	
	          /**
	           * remove all child nodes
	           */
	          try {
	            app.elements.searchResultsContainer.getElementsByTagName('h2')[ 0 ].remove();
	            app.elements.searchResultList.remove();
	          }
	          catch (elementMissingError) {
	          }
	
	          /**
	           * if there are no results, just append the banner
	           */
	          if (results.length === 0) {
	            app.templates.noSearchResults(query).then(function(element) {
	              app.elements.searchResultsContainer.appendChild(element);
	            }).then(function() {
	
	              return callback();
	            });
	          }
	
	          app.elements.searchResultsContainer.appendChild(app.helpers.createNode('ul', { class: 'invoices' }));
	          app.elements.searchResultList = app.elements.searchResultsContainer.getElementsByTagName('ul') [ 0 ];
	
	          app.templates.nSearchResults(results.length, query).then(function(element) {
	            app.elements.searchResultsContainer.insertBefore(element, app.elements.searchResultsContainer.firstChild);
	          }).then(function() {
	            var resultPromises = [];
	
	            /**
	             * iterate over search results, append the result template for each
	             */
	            for (var i = 0; i < results.length; i++) {
	              resultPromises.push(app.templates.searchResult(results[ i ]).then(function(element) {
	                  app.elements.searchResultList.appendChild(element);
	                })
	              );
	            }
	
	            return Promise.all(resultPromises).then(function() {
	              return callback();
	            });
	          });
	        });
	      };
	
	      /**
	       * template for the "no results" banner
	       *
	       * @param {string} query  the original search query
	       */
	      app.templates.noSearchResults = function(query) {
	        return app.helpers.createTranslatedElement('<h2 class="no-results">[[search:no_results, ' + query + ']]</h2>');
	      };
	
	      app.templates.nSearchResults = function(resultCount, query) {
	        if (resultCount === 1) {
	          return app.helpers.createTranslatedElement('<h2>[[search:single_result, ' + query + ']]</h2>');
	        }
	
	        return app.helpers.createTranslatedElement('<h2>[[search:multiple_results, ' + resultCount + ', ' + query + ']]</h2>');
	      };
	
	      /**
	       * template for a single search result entry
	       *
	       * @param {object} result            an object containing all result data
	       */
	      app.templates.searchResult = function(result) {
	        var template = '<li class="search-result invoice' + (result.ownInvoice ? ' own-invoice' : '') + '" id="' + result._id + '">' +
	          '<section class="invoice-image">' +
	          '<img src="/images/invoices/' + result.user._id + '/' + result._id + '.jpg" alt="Rechnung ' + result._id + '" onerror="app.events.imageError(this)">' +
	          '</section>' +
	          '<section class="invoice-data">' +
	          '<div class="invoice-id">' + result._id + '</div>' +
	          '<div class="invoice-owner" id="' + result.user._id + '">' +
	          '<div class="profile-picture">' +
	          '<img src="/images/users/' + result.user._id + '.jpg" alt>' +
	          '</div>' +
	          '<span class="owner-name">' + result.user.firstName + ' ' + result.user.lastName + '</span>' +
	          '</div>' +
	          '[[invoices:date]]: <span class="invoice-creation-date">' + result.creationDate + '</span><br>' +
	          '[[invoices:sum]]:' + (result.sum ? '<span class="invoice-sum">' + result.sum + '</span>€' : '[[invoices:no_sum]]') +
	          '<br>' +
	          '<div class="tags-label">[[invoices:tags]]:</div>' +
	          '<div class="invoice-tags">';
	
	        if (result.tags.length) {
	          for (var i = 0; i < result.tags.length; i++) {
	            template += '<div class="tag tag-' + result.tags[ i ].color + '" id="' + result.tags[ i ]._id + '">' +
	              '<span>' + result.tags[ i ].name + '</span>' +
	              '</div>';
	          }
	        } else {
	          template += '<span class="no-tags">[[invoices:no_tags]]</span>';
	        }
	
	        template += '</div>' +
	          '</section>' +
	          '<section class="invoice-actions" data-own="' + result.ownInvoice + '">' +
	          '<a class="button" href="/invoices/' + result._id + '"><span class="fa fa-eye"></span> [[global:details]]</a>';
	
	        if (result.ownInvoice) {
	          template += '<a class="button" href="/invoices/' + result._id + '/edit"><span class="fa fa-edit"></span> [[global:edit]]</a>' +
	            '<a class="button danger" href="/invoices/' + result._id + '/delete"><span class="fa fa-trash-o"></span> [[global:delete]]</a>';
	        }
	
	        template += '</section></li>';
	
	        return app.helpers.createTranslatedElement(template);
	      };
	
	      /**
	       * Attach all event listeners for the invoice search page
	       */
	      app.listeners.addInvoiceSearchEvents();
	    }
	  );
	})(app);


/***/ }
]);
//# sourceMappingURL=invoices.search.map