'use strict';

module.exports = function(app) {
  var vanillaModal = require('vanilla-modal');

  app.modals = {
    instance: null
  };

  app.templates.baseModalTemplate = app.helpers.createElement('<div class="modal-overlay">' +
    '<div class="modal">' +
    '<button type="button" class="seamless" data-close-modal><span class="fa fa-times"></span></button>' +
    '<article class="modal-content"></article>' +
    '</div>' +
    '</div>');

  // append the modal template, if not yet present
  if (!document.querySelector('.modal-overlay')) {
    document.body.appendChild(app.templates.baseModalTemplate);
  }

  // create a new modal with the merged configuration data and store it
  app.modals.instance = new vanillaModal({
    modal:        '.modal-overlay',
    modalInner:   '.modal',
    modalContent: '.modal-content',
    open:         '[data-open-modal]',
    close:        '[data-close-modal]',
    page:         'body',
    loadClass:    'modal-root',
    onBeforeOpen: function(event) {
      if (app.events.hasOwnProperty(event.target.dataset.onModalOpenEvent)) {
        app.debug('modal opener has open event callback attached');
        app.events[ event.target.dataset.onModalOpenEvent ](event);
      }
    }
  });
};
