'use strict';

module.exports = function(app) {

  /**
   *  Returns a function, that, as long as it continues to be invoked, will not be triggered.
   *  The function will be called after it stops being called for N milliseconds.
   *  If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
   *
   * @credit https://davidwalsh.name/javascript-debounce-function
   * @param func
   * @param wait
   * @param immediate
   * @returns {Function}
   */
  app.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later   = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  /**
   * registers an event listener in a try-catch block to catch errors in events.
   * optionally debounces events
   *
   * @param {string|Array}    eventNames  a single or multiple events to attach a listener on
   * @param {object|function} [target]    the event target to listen on
   * @param {function}        callback    the event callback to attach
   * @param {boolean}         [debounce]  whether to debounce the event or not, defaults to false
   */
  app.on = function(eventNames, target, callback, debounce) {
    if (typeof target === 'function') {
      callback = target;
      target   = window;
    }

    if (debounce) {
      callback = app.debounce(callback, 250);
    }

    eventNames = eventNames.split(' ');
    for (var i = 0; i < eventNames.length; i++) {
      var eventName = eventNames[ i ];

      target.addEventListener(eventName, function(event) {
        try {
          return callback(event);
        } catch (error) {
          return app.error(error);
        }
      }, false);
    }
  };
};
