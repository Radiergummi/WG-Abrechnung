'use strict';

const flatpickr = require('./libraries/flatpickr'),
      app       = require('./app'),
      main      = require('./main')(app);

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
      tagContainer:    app.dom('.invoice-tags'),
      tags:            app.dom('#invoice-tag'),
      uploadProgress:  app.dom('.invoice-upload-progress')
    };
    app.elements.saveNewInvoiceButton = app.dom('#save-invoice');

    // initialize the date picker
    flatpickr(app, app.elements.newInvoice.date[ 0 ]);

    app.listeners.addCreateInvoiceFormListeners = function() {
      app.elements.saveNewInvoiceButton.on('click', app.events.saveNewInvoice);
    };

    app.listeners.addTagInputListeners          = function() {
      app.elements.newInvoice.tags.on('keydown', app.events.addNewTagInput);
    };

    app.listeners.addDragUploadListeners        = function() {
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
      let data = new FormData(),
          tags = [];

      if (!app.elements.newInvoice.date.value()) {
        app.elements.newInvoice.date.value(new Date());
      }

      // iterate over tag elements
      app.elements.newInvoice.tagContainer.each(function(tagItem) {
        let tag = tagItem.text(tagItem.text().replace(/\s/, ''));

        // if the tag is already in the tag list or has a length of 0, don't append it
        if (tags.indexOf(tag) !== -1 || !tag) {
          return;
        }

        // append the tag name to the tag list
        tags.push(tag);
      });
      /*
      for (var i = 0; i < app.elements.newInvoice.tagContainer.children.length; i++) {

        // get the tag name from the current item, removing any potential white space from it
        var tag = app.elements.newInvoice.tagContainer.children[ i ].textContent.replace(/\s/, '');

        // if the tag is already in the tag list or has a length of 0, don't append it
        if (tags.indexOf(tag) !== -1 || !tag) {
          continue;
        }

        // append the tag name to the tag list
        tags.push(tag);
      }*/

      data.append('invoicePicture', (
          app.data.newInvoiceImage
            ? app.data.newInvoiceImage
            : app.elements.newInvoice.picture.files[ 0 ]
        )
      );
      data.append('creationDate', app.elements.newInvoice.date.value);
      data.append('sum', app.elements.newInvoice.sum.value);
      data.append('tags', tags);
      //data.append('_csrf', document.body.dataset.csrfToken);

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

    app.events.addNewTagInput = function(event) {

      // switch on finish tag characters
      switch (event.keyCode) {
        case 13: // Enter
        case 9:  // Tab
        case 32: // Space

          // prevent inserting the character
          event.preventDefault();

          // don't finish the tag if its text length is shorter than 3 chars
          if (event.target.value.length < 3) {
            return true;
          }

          // insert the new tag before the last child of the parent item (= the input element)
          event.target.parentNode.insertBefore(app.templates.newTagInput(event.target.value), event.target.lastChild);

          // clear the input value
          event.target.value = '';

          // retrieve last tag
          var allTags = document.getElementsByClassName('tag'),
              lastTag = allTags[ allTags.length - 1 ];

          // check if the tag exists
          app.connectors.checkTagExists(lastTag);

          // attach remove button event listener
          app.on('click', lastTag.getElementsByClassName('remove-tag')[ 0 ], app.events.removeTag);
          break;
        default:
          return true;
      }
    };

    app.events.removeTag = function(event) {
      event.target.parentNode.remove();
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

    app.connectors.checkTagExists = function(tagItem) {
      var tagName = tagItem.textContent.replace(/\s/, '');

      app.io.emit('dashboard.getTag', tagName, function(error, tag) {
        if (error || !tag) {
          return;
        }

        tagItem.classList.add('tag-' + tag.color);
      });
    };

    app.templates.newTagInput = function(tagName) {
      return app.helpers.createElement('<div class="tag">' + tagName + ' <span class="remove-tag fa fa-times"></span></div>');
    };

    app.listeners.addCreateInvoiceFormListeners();
    app.listeners.addTagInputListeners();
    app.listeners.addDragUploadListeners();
  });
})(app);
