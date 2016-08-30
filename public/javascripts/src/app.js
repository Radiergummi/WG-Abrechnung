'use strict';

/**
 * main client app
 */
var app = module.exports =  {
  elements:   {}, // dom elements being used in the script
  listeners:  {}, // functions that attach listeners
  events:     {}, // event callbacks
  helpers:    {}, // global helper functions
  connectors: {}, // socket or ajax initiating functions
  templates:  {}, // dom element templates
  startup:    [], // startup callbacks that register all of the above
  config:     {}, // app config data from the server
  data:       {}  // arbitrary data to access globally
};

(function(app) {
  /**
   * default error handler that logs errors to the console. can be replaced
   * with more sophisticated handlers, as long as they take an error object
   * as their first parameter.
   *
   * @param {Error}  error              the thrown error object
   * @param {string} [friendlyMessage]  an optional friendly error message
   * @returns {*}
   */
  app.error = function(error, friendlyMessage) {
    if (friendlyMessage) {
      try {
        app.translate(friendlyMessage, function(translated) {
          return console.error(translated, error);
        });
      } catch (error) {

        console.error('Could not translate error message!');
        return console.error(friendlyMessage, error);
      }
    }

    return console.error('An error occurred:', error);
  };

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

  /**
   * opens an HTTP request. uses the fetch API if available or falls back to XHR.
   *
   * @param {string}   method           the HTTP method
   * @param {string}   url              the request URL
   * @param {object}   [data]           a set of key-value pairs for GET requests or the body object
   * @param {function} [success]        a success callback
   * @param {function} [failure]        a failure callback
   * @param {object}   [events]         an object containing named events to attach to the request
   * @returns {XMLHttpRequest|Promise}  the request object. either a promise or the XHR
   */
  app.httpRequest = function(method, url, data, success, failure, events) {
    method  = method.toUpperCase();
    data    = data || undefined;
    success = success || function() {
      };
    failure = failure || function() {
      };
    events  = events || {};

    if (window[ 'fetch' ]) {
      return fetch(new Request(url, {
        method: method,
        body:   data
      })).then(function(response) {
        if (response.ok) {
          success.call(this, response);
        } else {
          failure.call(this, response);
        }

        return response;
      }, function(error) {
        failure.call(this, error);

        return error;
      });
    } else {
      var XHR = new XMLHttpRequest();
      XHR.open(method, url, true);

      XHR.onreadystatechange = function() {

        // when the data is available, fire the callback
        if (XHR.readyState == 4) {
          if (XHR.status == "200") {
            success.call(this, XHR);
          } else {
            failure.call(this, XHR);
          }
        }

      };

      for (var i in events) {
        if (events.hasOwnProperty(i)) {
          XHR[ i ] = events[ i ];
        }
      }

      XHR.send(data);
      return XHR;
    }
  };

  app.get = function(url, data, success, failure, events) {
    if (data) {
      url = url + '?';

      var parameters = [];

      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          parameters.push(i + '=' + data[ i ]);
        }
      }

      url = url + parameters.join('&');
    }

    return app.httpRequest('get', url, null, success, failure, events);
  };

  app.post = function(url, data, success, failure, events) {
    if (data) {
      if (data instanceof FormData) {

      }
    }
    return app.httpRequest('post', data, success, failure, events);
  };

  app.helpers.createNode = function(tagName, attributes, content) {
    var node = document.createElement(tagName);

    attributes = attributes || {};

    for (var attr in attributes) {
      if (!attributes.hasOwnProperty(attr)) {
        continue;
      }

      node.setAttribute(attr, attributes[ attr ]);
    }

    if (content !== undefined) {
      if (content.tagName) {
        node.appendChild(content);
      } else {
        node.textContent = content;
      }
    }

    return node;
  };

  app.helpers.createElement = function(elementString) {
    var parser = new DOMParser();

    return parser.parseFromString(elementString, 'text/html').body.childNodes[ 0 ];
  };

  app.helpers.createTranslatedElement = function(elementString) {
    var parser = new DOMParser();

    return new Promise(function(resolve) {
      app.translator.translate(elementString, app.config.language, function(translatedElementString) {
        resolve(parser.parseFromString(translatedElementString, 'text/html').body.childNodes[ 0 ]);
      });
    });
  };

  /**
   * Debounce function from https://davidwalsh.name/javascript-debounce-function
   * @param func
   * @param wait
   * @param immediate
   * @returns {Function}
   */
  app.helpers.debounce = function(func, wait, immediate) {
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

  app.connectors.getConfig = function(callback) {
    app.io.emit('app.getConfig', function(error, data) {
      if (error) {
        return console.error(error);
      }

      app.config = data;
//    Object.freeze(app.config);
      return callback();
    });
  };

  app.events.imageError = function(image) {
    image.onerror = '';
    image.src     = '/images/noImage.svg';
    image.classList.add('image-error');
    image.parentNode.title = 'Kein Bild verfügbar';

    return true;
  };
  
  app.events.onServerUpdate = function() {
    app.translate('[[global:server_updated.message]]|[[global:server_updated.reload]]|[[global:server_updated.later]]', function(translated) {
      var texts = translated.split('|');
      app.notifications.info(texts[ 0 ], [ {
        name: texts[ 1 ], action: function() {
          window.location.reload();
        }
      },
        {
          name: texts[ 2 ], action: function(notification) {
          notification.remove();
        }
        } ]);
    });
  };

  app.init = function() {
    document.addEventListener("DOMContentLoaded", function() {
      try {
        app.notifications = require('./modules/notifications');
        app.translator    = require('./modules/translator');

        // overwrite the default error handler
        app.error = function(error, friendlyMessage) {
          var message = friendlyMessage || error.message;

          try {
            app.translator.translate(friendlyMessage, document.documentElement.lang, function(translated) {
              console.log(error);
              return app.notifications.error(translated);
            });
          } catch (error) {
            console.log(error);
            return app.notifications.error(message);
          }
        };

        app.io = io();

        app.elements.overlay = document.getElementById('overlay');
        app.connectors.getConfig(function() {
          window.debug = app.config.debug;
          if (window.debug) {
            window.app = app;
            app.debug = console.debug.bind(console);
          } else {
            app.debug = function() {
              console.log('debugging disabled');
            }
          }

          app.translate = function(text, callback) {
            return app.translator.translate(text, document.documentElement.lang, callback);
          };

          // call all startup scripts
          for (var i = 0; i < app.startup.length; i++) {
            try {
              app.startup[ i ].call(app);
            } catch (error) {
              return app.error(error, '[[clientError:while_startup]]');
            }
          }
        });

        app.io.on('app.updated', app.events.onServerUpdate);
        window.addEventListener('flatm8:ready', function(event) {
          console.log('app ready!');
        });
        window.dispatchEvent(new Event('flatm8:ready'));

        return app;
      } catch (error) {
        return app.error(error, '[[clientError:while_dependencies]]');
      }
    });
  };

  app.init();
})(app);
