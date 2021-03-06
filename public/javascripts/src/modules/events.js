'use strict';

module.exports = function(app) {

  /**
   *  Returns a function, that, as long as it continues to be invoked, will not be triggered.
   *  The function will be called after it stops being called for N milliseconds.
   *  If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
   *
   * @credit https://davidwalsh.name/javascript-debounce-function
   *
   * @param   {function} func        the function to debounce
   * @param   {number}   wait        the timeout duration
   * @param   {boolean}  [immediate] the edge to trigger on
   * @returns {function}             the debounced callback
   */
  app.debounce = function(func, wait, immediate) {
    let timeout;
    return function() {
      let context = this,
          args    = arguments;

      let later = function() {
        timeout = null;

        if (!immediate) {
          func.apply(context, args);
        }
      };

      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  /**
   * registers an event listener in a try-catch block to catch errors in events.
   * optionally debounces events
   *
   * @param {string|Array}     eventNames                a single or multiple events to attach a listener on
   * @param {object|function}  [targets]                 the event target to listen on
   * @param {function|boolean} callback                  the event callback to attach
   * @param {object}           [options]                 event options
   * @param {boolean}          [options.capture]
   * @param {boolean}          [options.once]
   * @param {boolean}          [options.passive]
   * @param {boolean}          [options.debounce]        whether to debounce the event, defaults to false
   * @param {boolean}          [options.preventDefault]  whether to prevent the default event
   * @param {boolean}          [options.propagate]       whether to stop propagation
   */
  app.on = function(eventNames, targets, callback, options) {

    // shift arguments if necessary
    if (typeof targets === 'function') {
      options  = callback;
      callback = targets;
      targets  = [ document ];
    } else {

      // create array from target
      targets = app.dom(targets);
    }

    options = Object.assign({
      capture:        false,
      once:           false,
      passive:        false,
      debounce:       false,
      preventDefault: false,
      propagate:      false
    }, options);

    // debounce the callback
    if (options.debounce) {
      callback = app.debounce(callback, 250);
    }

    function safeCallback (event) {
      try {
        if (options.preventDefault) {
          event.preventDefault();
        }

        if (options.propagate) {
          event.stopPropagation();
        }

        return callback(event);
      } catch (error) {
        return app.error(error);
      }
    }

    // split event names by space to allow assigning multiple events
    eventNames = eventNames.split(' ');

    // iterate over elements and events to attach all events to all elements
    for (let t = 0; t < targets.length; t++) {
      for (let e = 0; e < eventNames.length; e++) {
        let eventName = eventNames[ e ],
            target    = targets[ t ];

        // add the attached events registry to the target if not present
        if (!target.hasOwnProperty('_attachedEvents')) {
          target._attachedEvents = {};
        }

        // register the callback for easier removal
        if (target._attachedEvents[ eventName ] !== safeCallback) {
          target._attachedEvents[ eventName ] = safeCallback;
        }

        // add the event listener with the callback in a try-catch block
        // to forward any errors to the apps error handler
        target.addEventListener(eventName, safeCallback, options);
      }
    }
  };

  /**
   * removes an event listeners
   *
   * @param {string|Array}                      eventNames  the event(s) to remove listeners for
   * @param {NodeList|Array|EventTarget|Window} [targets]   the target(s) to remove listeners from. if none given,
   *                                                        will use the window object
   * @param {function}                          [callback]  the callback to remove. takes the callback stored in the
   *                                                        target if none given
   */
  app.off = function(eventNames, targets, callback) {
    if (typeof targets === 'function') {
      callback = targets;
      targets  = document;
    }

    // create array from target
    targets = (targets instanceof NodeList
        ? Array.prototype.slice.call(targets)
        : [ targets ]
    );

    // split event names by space to allow assigning multiple events
    eventNames = (eventNames instanceof Array
        ? eventNames
        : eventNames.split(' ')
    );

    // iterate over elements and events to remove all events from all elements
    for (let t = 0; t < targets.length; t++) {
      for (let e = 0; e < eventNames.length; e++) {
        let eventName = eventNames[ e ],
            target    = targets[ t ];

        // use the stored event callback if none specified
        if (!callback) {
          callback = target._attachedEvents[ eventName ];
        }

        if (!target._attachedEvents.hasOwnProperty(eventName)) {
          continue;
        }

        // remove the event listener
        target.removeEventListener(eventName, callback);

        // remove the stored callback
        delete target._attachedEvents[ eventName ];
      }
    }
  };

  app.trigger = function(eventNames, targets, data) {

    // shift arguments
    if (
      typeof data === 'undefined' &&
      typeof targets === 'object' && !(
        targets instanceof NodeList ||
        targets instanceof HTMLCollection
      )
    ) {
      data    = targets;
      targets = window;
    }

    if (data) {
      data = {
        detail: data
      }
    }

    // create array from target
    targets = (targets instanceof NodeList
        ? Array.prototype.slice.call(targets)
        : [ targets ]
    );

    // split event names by space to allow assigning multiple events
    eventNames = (eventNames instanceof Array
        ? eventNames
        : eventNames.split(' ')
    );

    // iterate over elements and events to attach all events to all elements
    for (let t = 0; t < targets.length; t++) {
      for (let e = 0; e < eventNames.length; e++) {
        const eventName = eventNames[ e ],
              target    = targets[ t ];

        target.dispatchEvent(new CustomEvent(eventName, data));
      }
    }
  };
};
