'use strict';

if (!app) {
  var app = require('./app');
}

(function() {
  app.startup.push(function() {
    var invoicePage = 0;

    app.elements.invoicesContainer = document.getElementsByClassName('invoices')[ 0 ];
    app.elements.invoices = app.elements.invoicesContainer.getElementsByClassName('invoice');
    app.elements.lastInvoice = app.elements.invoices[ app.elements.invoices.length - 1 ];

    app.listeners.addInvoicesEvents = function() {
      addEventListener('DOMContentLoaded', app.events.lastInvoiceVisible);
      addEventListener('load', app.events.lastInvoiceVisible);
      addEventListener('scroll', app.events.lastInvoiceVisible);
      addEventListener('resize', app.events.lastInvoiceVisible);

//      app.elements.lastInvoice.addEventListener();
    };

    app.events.lastInvoiceVisible = function(event) {
      return app.helpers.onVisibilityChange(event.target, function() {
        return app.connectors.getMoreInvoices();
      });
    };

    app.helpers.isElementInViewport = function(element) {
      var rect = element.getBoundingClientRect();

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    };

    app.helpers.onVisibilityChange = function(element, callback) {
      var previousVisibility;
      return function() {
        var isVisible = app.helpers.isElementInViewport(element);

        if (isVisible != previousVisibility) {
          previousVisibility = isVisible;

          if (typeof callback == 'function') {
            return callback();
          }
        }
      }
    };

    app.connectors.getMoreInvoices = function() {
      invoicePage++;

      app.io.emit('invoices.getPaginated', {
        userId: app.config.user._id,
        pageNumber: invoicePage,
        pageSize: 1
      }, function(error, invoices) {
        if (error) {
          console.error(error);
        }

        if (invoices) {
          console.info(invoices);
        }
      });
    };

    app.listeners.addInvoicesEvents();
  });
})();
