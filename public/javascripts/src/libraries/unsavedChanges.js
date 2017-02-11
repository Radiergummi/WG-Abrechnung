'use strict';

/*
 global module,
 require
 */

/**
 * creates a watcher for changes made and sets onbeforeunload accordingly
 *
 * @param {object}             app      the app
 * @param {Array.<DOMElement>} elements an array of DOMElements
 */
const unsavedChangesWatcher = function(app, elements) {
  if (elements.length < 1) {
    return;
  }

  this.app       = app;
  this.observers = [];

  /**
   * sets the app in a dirty state and enables the onbeforeunload callback
   * 
   * @param {object} event the change event for input elements or the
   *                       mutations object for containers
   */
  this.setDirty = function(event) {
    app.__dirty           = true;
    window.onbeforeunload = event => 'save changes';
    app.debug('input data has been changed.', event);
  };

  window.onbeforeunload = null;

  elements.forEach(element => {
    if (element.isInput()) {
      element.on('change', this.setDirty);
    } else {
      if (element.is('div')) {
        let observer = new MutationObserver((mutations, instance) => {
          this.setDirty(mutations);
        });

        // store the observer reference
        this.observers.push(observer);

        // observe the DIV element
        observer.observe(element[ 0 ], {
          childList:             true,
          attributes:            false,
          characterData:         false,
          subtree:               true,
          attributeOldValue:     false,
          characterDataOldValue: false
        });
      }
    }
  });
};

/**
 * allows to disconnect all mutation observers once they
 * are not needed anymore
 *
 * @returns void
 */
unsavedChangesWatcher.destroy = function() {
  this.app.__dirty = false;
  this.observers.forEach(observer => observer.disconnect());
  window.onbeforeunload = null;
};

module.exports = unsavedChangesWatcher;
