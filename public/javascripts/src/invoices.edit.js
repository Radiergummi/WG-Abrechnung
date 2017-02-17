'use strict';

/*
 global module,
 require
 */

const flatpickr             = require('./libraries/flatpickr'),
      taggle                = require('./libraries/taggle'),
      compare               = require('./libraries/objectComparator'),
      UnsavedChangesWatcher = require('./libraries/unsavedChangesWatcher'),
      app                   = require('./app'),
      main                  = require('./main')(app),

      getFirstDayOfMonth    = function(date) {
        let baseDate = new Date(date);

        return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      },
      getLastDayOfMonth     = function(date) {
        let baseDate = new Date(date);

        return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      };

(function(app) {
  app.startup.push(function() {
    app.elements.invoice = {
      id:   app.dom('.invoice-id'),
      date: app.dom('#invoice-creation-date'),
      sum:  app.dom('#invoice-sum'),
      note: app.dom('#invoice-note'),
      tags: app.dom('.invoice-tags')
    };

    app.elements.saveInvoice = app.dom('#save-invoice');

    const invoiceData = {
      id:   app.dom('.invoice').id(),
      date: app.elements.invoice.date.value(),
      sum:  app.elements.invoice.sum.value(),
      note:  app.elements.invoice.note.value(),
      tags: app.dom('[name="tags"]').map(tag => tag.value)
    };

    // initialize the date picker
    flatpickr(app, app.elements.invoice.date[ 0 ], {
      minDate: getFirstDayOfMonth(app.elements.invoice.date[ 0 ].value),
      maxDate: getLastDayOfMonth(app.elements.invoice.date[ 0 ].value)
    });

    // initialize the tag input
    taggle(app, app.elements.invoice.tags);

    app.listeners.addInvoiceFormListeners = function() {
      app.elements.saveInvoice.on('click', app.events.saveInvoiceChanges);
    };

    app.events.saveInvoiceChanges = function(event) {
      let data = compare(app, invoiceData, {
        id:   app.dom('.invoice').id(),
        date: app.elements.invoice.date.value(),
        sum:  app.elements.invoice.sum.value(),
        note: app.elements.invoice.note[ 0 ].innerText,
        tags: app.dom('[name="tags"]').map(tag => tag.value)
      });

      data.invoicePicture = new File([], '');

      app.http.put('/api/invoices/' + invoiceData.id, data, response => {
        if (response.ok) {

          // destroy the unsaved changes listener, since we're about to leave the page
          unsavedChanges.destroy();

          return window.location.href = response.headers.get('Location');
        }

        app.debug(response);
      });
    };

    // warn for unsaved changes
    let unsavedChanges = new UnsavedChangesWatcher(app, [
      app.elements.invoice.date,
      app.elements.invoice.sum,
      app.elements.invoice.tags
    ]);

    app.listeners.addInvoiceFormListeners();
  });
})(app);
