'use strict';

/*
 global module,
 require
 */

/**
 * Creates a new watcher for unsaved form changes
 *
 * @class unsavedChangesWatcher
 */
class UnsavedChangesWatcher {

  /**
   * creates the watcher
   *
   * @param {object} app                  the app object
   * @param {Array.<DOMElement>} elements the elements to watch
   */
  constructor (app, elements) {
    if (elements.length < 1) {
      return;
    }

    // store the app reference
    this.App = app;

    // store all observers
    this.observers = [];

    // set the onbeforeunload callback to null initially
    window.onbeforeunload = null;

    // iterate over all elements to attach listeners
    elements.forEach(element => this.attachObserver(element));
  }

  /**
   * sets a dirty state and applies the onbeforeunload callback
   */
  setDirty () {
    this.App.__dirty      = true;
    window.onbeforeunload = event => 'save changes';
    this.App.debug('input data has been changed.', event);
  }

  /**
   * removes the dirty state and onbeforeunload callback
   */
  destroy () {
    this.App.__dirty = false;
    this.observers.forEach(observer => observer.disconnect());
    window.onbeforeunload = null;
  }

  /**
   * attaches an observer to an element. will use onchange for form
   * elements and a MutationObserver for container elements
   *
   * @param   {DOMElement} element the element to observe
   * @returns {*}
   */
  attachObserver (element) {

    // if the element is an input, attach an onchange listener
    if (element.isInput()) {
      return element.on('change', event => this.setDirty(event));
    }

    // if the element is a container, attach a MutationObserver
    if (element.is('div')) {

      // create the observer object
      let observer = new MutationObserver(mutations => {

        // provide the mutations object to the callback
        return this.setDirty(mutations);
      });

      // store the observer reference
      this.observers.push(observer);

      // observe the DIV element for changes to child elements
      return observer.observe(element[ 0 ], {
        childList:             true,
        subtree:               true,
        attributes:            false,
        characterData:         false,
        attributeOldValue:     false,
        characterDataOldValue: false
      });
    }
  }
}

module.exports = UnsavedChangesWatcher;
