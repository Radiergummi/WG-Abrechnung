'use strict';

var app = app || {};

(function() {

  /**
   * push the code into the app startup stack
   */
  app.startup.push(function() {
    app.elements.overlay              = document.getElementById('overlay');
    app.elements.invoiceData          = document.getElementsByClassName('invoice-data')[ 0 ];
    app.elements.newInvoice           = {
      picture:         document.getElementById('invoice-picture'),
      pictureDropArea: document.getElementsByClassName('invoice-picture-drop-area')[ 0 ],
      date:            document.getElementById('invoice-creation-date'),
      sum:             document.getElementById('invoice-sum'),
      tagContainer:    document.getElementsByClassName('invoice-tags')[ 0 ],
      tags:            document.getElementById('invoice-tag'),
      uploadProgress:  document.getElementsByClassName('invoice-upload-progress')[ 0 ]
    };
    app.elements.saveNewInvoiceButton = document.getElementById('save-invoice');

    app.listeners.addCreateInvoiceFormListeners = function() {
      app.on('click', app.elements.saveNewInvoiceButton, app.events.saveNewInvoice);
    };
    app.listeners.addTagInputListeners          = function() {
      app.on('keydown', app.elements.newInvoice.tags, app.events.addNewTagInput);
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
      app.on('dragenter', app.elements.newInvoice.pictureDropArea, app.events.isDragging);
      app.on('drag dragover dragstart', app.elements.newInvoice.pictureDropArea, app.events.startedDragging, true);
      app.on('dragleave dragend', app.elements.newInvoice.pictureDropArea, app.events.stoppedDragging);
      app.on('drop', app.elements.newInvoice.pictureDropArea, app.events.renderPreviewPicture);
      // app.on('drop', document.body, app.events.startedDragging);
    };

    app.events.saveNewInvoice = function(event) {


      var data = new FormData(),
          tags = [];

      if (!app.elements.newInvoice.date.value) {
        app.elements.newInvoice.date.value = new Date();
      }

      // iterate over tag elements
      for (var i = 0; i < app.elements.newInvoice.tagContainer.children.length; i++) {

        // get the tag name from the current item, removing any potential white space from it
        var tag = app.elements.newInvoice.tagContainer.children[ i ].textContent.replace(/\s/, '');

        // if the tag is already in the tag list or has a length of 0, don't append it
        if (tags.indexOf(tag) !== -1 || !tag) {
          continue;
        }

        // append the tag name to the tag list
        tags.push(tag);
      }

      data.append('invoicePicture', (app.data.newInvoiceImage
        ? app.data.newInvoiceImage
        : app.elements.newInvoice.picture.files[ 0 ])
      );
      data.append('creationDate', app.elements.newInvoice.date.value);
      data.append('sum', app.elements.newInvoice.sum.value);
      data.append('tags', tags);

      if (window[ 'fetch' ]) {
        fetch(new Request('/api/invoices/create', {
          method: 'post',
          body:   data
        })).then(function(response) {
          if (response.ok) {
            app.translate('[[invoices:create_success]]', function(translated) {
              app.notifications.success(translated);
            });
          } else {
            app.error('Response status %s indicates error', response.status);
          }
        }, function(error) {
          console.error('An error occurred trying to save the invoice');
        });
      } else {
        var request = new XMLHttpRequest();
        request.open('POST', '/api/invoices/create', true);

        request.onreadystatechange = function() {

          // when the data is available, fire the callback
          if (request.readyState == 4) {

            if (request.status == "200") {
              console.log('response is okay. invoice has been saved.', request);
              return window.location = request.responseURL;
            } else {
              return app.error(new Error('XMLHttpRequest failed: Error ' + request.status + ' - ' + request.statusText), '[[clientError:save_invoice_failed, ' + request.status + ']]');
            }
          }
        };

        // update the progress meter
        request.upload.onprogress = function (event) {
          if (event.lengthComputable) {
            app.elements.newInvoice.uploadProgress.value = (event.loaded / event.total * 100 | 0);
          }
        };

        // finish the progress meter
        request.onload = function() {
          app.elements.newInvoice.uploadProgress.value = 100;
        };

        request.send(data);
      }
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
      app.elements.newInvoice.pictureDropArea.classList.add('dragged-over');
      return false;
    };

    app.events.stoppedDragging = function(event) {
      event.preventDefault();
      event.stopPropagation();
      app.elements.newInvoice.pictureDropArea.classList.remove('dragged-over');
      return false;
    };

    app.events.renderPreviewPicture = function(event) {
      event.preventDefault();
      event.stopPropagation();

      app.elements.newInvoice.pictureDropArea.classList.remove('dragged-over');
      app.elements.newInvoice.pictureDropArea.classList.add('loading-preview');

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

        app.elements.newInvoice.pictureDropArea.classList.remove('loading-preview');
        app.elements.newInvoice.pictureDropArea.classList.add('loaded-preview');
        app.elements.newInvoice.pictureDropArea.appendChild(image);
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
})();
