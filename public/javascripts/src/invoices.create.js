'use strict';

const flatpickr             = require('./libraries/flatpickr'),
      taggle                = require('./libraries/taggle'),
      UnsavedChangesWatcher = require('./libraries/unsavedChangesWatcher'),
      app                   = require('./app'),
      main                  = require('./main')(app);

(function(app) {

  /**
   * push the code into the app startup stack
   */
  app.startup.push(function() {
    app.elements.overlay              = app.dom('#overlay');
    app.elements.invoiceData          = app.dom('.invoice-data');
    app.elements.newInvoice           = {
      picture:         app.dom('#invoice-picture'),
      pictureDropArea: app.dom('.invoice-picture-drop-area'),
      date:            app.dom('#invoice-creation-date'),
      sum:             app.dom('#invoice-sum'),
      note:            app.dom('#invoice-note'),
      tags:            app.dom('.invoice-tags'),
      uploadProgress:  app.dom('.invoice-upload-progress')
    };
    app.elements.saveNewInvoiceButton = app.dom('#save-invoice');

    // initialize the date picker
    flatpickr(app, app.elements.newInvoice.date[ 0 ]);

    // initialize the tag input
    taggle(app, app.elements.newInvoice.tags);

    app.listeners.addCreateInvoiceFormListeners = function() {
      app.elements.saveNewInvoiceButton.on('click', app.events.saveNewInvoice);
    };

    app.listeners.addDragUploadListeners = function() {
      app.on('dragover', document.body, app.events.startedDragging);
      app.on('drop', document.body, function(event) {
        event.preventDefault();
        event.stopPropagation();
        app.translate('[[global:outside_dnd_area]]', function(translated) {
          app.notifications.info(translated);
        });

        return false;
      });
      app.elements.newInvoice.pictureDropArea.on('dragenter', app.events.isDragging);
      app.elements.newInvoice.pictureDropArea.on('drag dragover dragstart', app.events.startedDragging, true);
      app.elements.newInvoice.pictureDropArea.on('dragleave dragend', app.events.stoppedDragging);
      app.elements.newInvoice.pictureDropArea.on('drop', app.events.renderPreviewPicture);
      // app.on('drop', document.body, app.events.startedDragging);
    };

    app.events.saveNewInvoice = function(event) {
      const data = new FormData();

      if (!app.elements.newInvoice.date.value()) {
        app.elements.newInvoice.date.value(new Date());
      }

      data.append('invoicePicture', (
          app.data.newInvoiceImage
            ? app.data.newInvoiceImage
            : app.elements.newInvoice.picture.files[ 0 ]
        )
      );
      data.append('creationDate', app.elements.newInvoice.date.value());
      data.append('sum', app.elements.newInvoice.sum.value());
      data.append('note', app.elements.newInvoice.note.value());
      data.append('tags', app.dom('[name="tags"]').map(tag => tag.value));
      data.append('_csrf', document.body.dataset.csrfToken);

      for (let pair of data.entries()) {
        app.debug(`form field ${pair[ 0 ]} is ${pair[ 1 ]}`);
      }

      app.http.post('/api/invoices', data, function(response) {
        if (response.ok) {
          app.notifications.success('[[invoices:create_success]]');
        } else {
          return app.error(new Error('POST failed: Error ' + response.status + ' - ' + response.responseText.message.raw), response.responseText.message.translation);//'[[clientError:save_invoice_failed, ' + response.status + ']]');
        }
      });
    };

    app.events.startedDragging = function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    app.events.isDragging = function(event) {
      event.preventDefault();
      event.stopPropagation();
      app.elements.newInvoice.pictureDropArea.addClass('dragged-over');
      return false;
    };

    app.events.stoppedDragging = function(event) {
      event.preventDefault();
      event.stopPropagation();
      app.elements.newInvoice.pictureDropArea.removeClass('dragged-over');
      return false;
    };

    app.events.renderPreviewPicture = function(event) {
      event.preventDefault();
      event.stopPropagation();

      app.elements.newInvoice.pictureDropArea.removeClass('dragged-over');
      app.dom('img', app.elements.newInvoice.pictureDropArea).remove();
      app.elements.newInvoice.pictureDropArea.addClass('loading-preview');

      // retrieve the file from the dropped data
      var file = event.dataTransfer.files[ 0 ];

      // store the data for the upload
      app.data[ 'newInvoiceImage' ] = file;

      // create a file reader to parse the image and append it to the drop area
      var reader = new FileReader();

      reader.onload = function(event) {

        // create a new image and append the parse result as its source
        var image = new Image();
        image.src = event.target.result;

        app.elements.newInvoice.pictureDropArea.removeClass('loading-preview');
        app.elements.newInvoice.pictureDropArea.addClass('loaded-preview');
        app.elements.newInvoice.pictureDropArea.append(image);
      };

      reader.readAsDataURL(file);

      return false;
    };

    app.listeners.addCreateInvoiceFormListeners();
    app.listeners.addDragUploadListeners();
  });
})(app);
