webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app  = __webpack_require__(1),
	    main = __webpack_require__(59)(app);
	
	(function(app) {
	  app.startup.push(function () {
	
	    app.elements.invoicesContainer = document.getElementsByClassName('invoices')[ 0 ];
	    app.elements.invoices          = app.elements.invoicesContainer.getElementsByClassName('invoice');
	    app.elements.lastInvoice       = app.elements.invoices[ app.elements.invoices.length - 1 ];
	
	    app.listeners.addInvoicesEvents = function () {
	      app.on('DOMContentLoaded', app.events.lastInvoiceVisible, true);
	      app.on('load', app.events.lastInvoiceVisible, true);
	      app.on('scroll', app.events.lastInvoiceVisible, true);
	      app.on('resize', app.events.lastInvoiceVisible, true);
	
	//      app.elements.lastInvoice.addEventListener();
	    };
	
	    app.listeners.removeInvoiceEvents = function () {
	      app.off('DOMContentLoaded', app.events.lastInvoiceVisible);
	      app.off('load', app.events.lastInvoiceVisible);
	      app.off('scroll', app.events.lastInvoiceVisible);
	      app.off('resize', app.events.lastInvoiceVisible);
	    };
	
	    app.events.lastInvoiceVisible = function (event) {
	      var invoices    = app.elements.invoicesContainer.getElementsByClassName('invoice'),
	          lastInvoice = invoices[ invoices.length - 1 ];
	
	      return app.helpers.onVisibilityChange(lastInvoice, function (visibility) {
	        return app.connectors.getMoreInvoices();
	      })();
	    };
	
	    app.helpers.isElementInViewport = function (element) {
	      var rect = element.getBoundingClientRect();
	
	      return (
	        rect.top >= 0 &&
	        rect.left >= 0 &&
	        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
	        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	      );
	    };
	
	    app.helpers.onVisibilityChange = function (element, callback) {
	      return function () {
	        var isVisible = app.helpers.isElementInViewport(element);
	
	        //console.log('last invoice element is visible:', isVisible);
	        if (isVisible) {
	
	          if (typeof callback == 'function') {
	            return callback();
	          }
	        }
	      }
	    };
	
	    app.connectors.getMoreInvoices = function () {
	      var page = (document.getElementsByClassName('invoice').length) / 2;
	
	      // remove tail element
	      document.getElementsByClassName('timeline-data-available')[ 0 ].remove();
	
	      // insert loading indicator
	      app.elements.invoicesContainer.appendChild(app.templates.invoiceTimelineLoading);
	
	      app.io.emit('invoices.getPaginated', {
	        userId:     app.config.user.id,
	        pageNumber: page,
	        pageSize:   2
	      }, function (error, invoices) {
	        if (error) {
	          return console.error(error);
	        }
	
	        // wait a second
	        setTimeout(function () {
	
	          // remove the loading indicator
	          document.getElementsByClassName('timeline-loading')[ 0 ].remove();
	
	          if (invoices.length > 0) {
	
	            var invoicePromises = [];
	
	            // iterate over invoices
	            for (var i = 0; i < invoices.length; i ++) {
	
	              // insert a timeline separator
	              app.elements.invoicesContainer.appendChild(app.templates.invoiceTimelineSeparator());
	
	              // insert the invoice
	              invoicePromises.push(app.templates.invoiceCard(invoices[ i ]).then(function(element) {
	                app.elements.invoicesContainer.appendChild(element);
	              }));
	            }
	
	            Promise.all(invoicePromises).then(function() {
	              history.pushState(null, 'Rechnungen | Seite' + page, '/invoices/page/' + page);
	              app.elements.invoicesContainer.appendChild(app.templates.invoiceTimelineAvailabilityIndicator);
	            });
	          } else {
	            app.listeners.removeInvoiceEvents();
	            app.templates.invoiceTimelineEnd.then(function(element) {
	              app.elements.invoicesContainer.appendChild(element);
	            });
	          }
	
	        }, 1000);
	      });
	    };
	
	    app.templates.invoiceCard = (function () {
	      var userId = app.config.user.id;
	
	      return function (invoice) {
	        var template = '<article class="invoice" id="' + invoice._id + '">' +
	          '<section class="invoice-image">' +
	          '<img src="/images/invoices/' + userId + '/' + invoice._id + '.jpg" alt="Rechnung ' + invoice._id + '" onerror="app.events.imageError(this)">' +
	          '</section>' +
	          '<section class="invoice-data">' +
	          '<div class="invoice-id">' + invoice._id + '</div>' +
	          '<div class="invoice-owner">' +
	          '<div class="profile-picture">' +
	          '<img src="/images/users/' + invoice.user._id + '.jpg" alt>' +
	          '</div>' +
	          '<span class="owner-name">' + invoice.user.firstName + ' ' + invoice.user.lastName + '</span>' +
	          '</div>' +
	          '[[invoices:date]]: <span class="invoice-creation-date">' + invoice.creationDate + '</span><br>' +
	          '[[invoices:sum]]: <span class="invoice-sum">' + invoice.sum + '</span>€<br>' +
	          '<div class="tags-label">[[invoices:tags]]: </div>' +
	          '<div class="invoice-tags">';
	
	        if (invoice.tags.length) {
	          for (var i = 0; i < invoice.tags.length; i ++) {
	            template += '<div class="tag tag-' + invoice.tags[ i ].color + '" id="' + invoice.tags[ i ]._id + '">' +
	              '<span>' + invoice.tags[ i ].name + '</span>' +
	              '</div>';
	          }
	        } else {
	          template += '<span class="no-tags">[[invoices:no_tags]]</span>';
	        }
	
	        template += '</div>' +
	          '</section>' +
	          '<section class="invoice-actions">' +
	          '<a class="button" href="/invoices/' + invoice._id + '"><span class="fa fa-eye"></span> [[global:details]]</a>';
	
	        if (invoice.ownInvoice) {
	
	          template += '<a class="button" href="/invoices/' + invoice._id + '/edit"><span class="fa fa-edit"></span> [[global:edit]]</a>' +
	            '<a class="button danger" href="/invoices/' + invoice._id + '/delete"><span class="fa fa-trash-o"></span> [[global:delete]]</a>';
	        }
	
	        template += '</section>' +
	          '</article>';
	
	        return app.helpers.createTranslatedElement(template);
	      }
	    })();
	
	    app.templates.invoiceTimelineSeparator = function () {
	      return app.helpers.createElement('<div class="timeline-item timeline-separator timeline-within-range"></div>');
	    };
	
	    app.templates.invoiceTimelineLoading = (function () {
	      return app.helpers.createElement('<div class="timeline-item timeline-loading"></div>');
	    })();
	
	    app.templates.invoiceTimelineEnd = (function () {
	      return app.helpers.createTranslatedElement('<div class="timeline-item timeline-last" data-timeline-description="[[invoices:no_older]]"></div>');
	    })();
	
	    app.templates.invoiceTimelineAvailabilityIndicator = (function () {
	      return app.helpers.createElement('<div class="timeline-item timeline-data-available"></div>');
	    })();
	
	
	    app.listeners.addInvoicesEvents();
	  });
	})(app);


/***/ }
]);
//# sourceMappingURL=invoices.all.map