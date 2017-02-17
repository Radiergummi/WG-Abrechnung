'use strict';

/*
 global module,
 require
 */
const vex       = require('vex-js'),
      vexDialog = require('vex-dialog');

// register the native dialog plugin
vex.registerPlugin(vexDialog);

/**
 * the modals object, a container for methods
 *
 * @type {object}
 */
const modals = {};

/**
 * the vex instance
 *
 * @type {object}
 */
modals._vex = vex;

/**
 * initializes modals and sets vex defaults
 *
 * @param   {object} app      the app
 * @param   {object} [config] optional config data, will be merged with defaults
 * @returns {object}          the modals instance
 */
modals.init = function(app, config) {
  vex.defaultOptions = Object.assign({
    appendLocation:       '.modal-root',
    showCloseButton:      true,
    escapeButtonCloses:   true,
    overlayClosesOnClick: true,
    className:            'modal',
    overlayClassName:     'modal-overlay',
    contentClassName:     'modal-content',
    closeClassName:       'modal-close'
  }, config);

  return modals;
};

/**
 * creates a new modal. lower-level method used by the more specific ones,
 * wraps the callback in a promise
 *
 * @param   {object}   options  config data
 * @param   {function} [method] the vex method to use to render
 * @returns {Promise}           the promise-ified callback
 */
modals.create = function(options, method) {
  if (typeof method === 'undefined') {
    method = vex.open;
  }

  switch (options.type) {
    case 'warning':
      options.className = 'modal modal-warning';
      break;
  }

  /**
   * the create method returns a promise that resolves
   * once the callback has been called by vex
   */
  return new Promise(resolve => {
    options.callback = function(data) {
      return resolve(data);
    };

    // returns the open call
    return method(options);
  });
};

/**
 * creates a new confirm modal
 *
 * @param   {string}  content   the modal content
 * @param   {object}  [options] optional config data, merged with defaults
 * @returns {Promise}
 */
modals.confirm = function(content, options) {
  options = Object.assign({
    unsafeMessage:     content,
    buttonConfirmText: 'Confirm',
    buttonCancelText:  'Cancel'
  }, options);

  switch (options.type) {
    case 'warning':
      options.className = 'modal modal-warning';
      break;
  }

  options.buttons = [
    Object.assign({}, modals._vex.dialog.buttons.YES, {
      text: options.buttonConfirmText
    }),
    Object.assign({}, modals._vex.dialog.buttons.NO, {
      text: options.buttonCancelText
    })
  ];

  /**
   * the create method returns a promise that resolves
   * once the callback has been called by vex
   */
  return new Promise(resolve => {
    options.callback = function(data) {
      return resolve(data);
    };

    // returns the open call
    return modals._vex.dialog.confirm(options);
  });
};

/**
 * creates a new prompt modal
 *
 * @param   {string}  content   the modal content
 * @param   {object}  [options] optional config data, merged with defaults
 * @returns {Promise}
 */modals.prompt = function(content, options) {
  options = Object.assign({
    unsafeContent: content
  }, options);

  return modals.create(options);
};

/**
 * creates a new popup modal
 *
 * @param   {string}  content   the modal content
 * @param   {object}  [options] optional config data, merged with defaults
 * @returns {Promise}
 */
modals.popup = function(content, options) {
  options = Object.assign({
    unsafeContent: content
  }, options);

  return modals.create(options);
};

module.exports = modals.init;
