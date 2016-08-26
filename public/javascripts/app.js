'use strict';

/**
 * main client app
 */
var app = {
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
console.log('started app', app);
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
 * @param {string|Array} eventNames  a single or multiple events to attach a listener on
 * @param {object}       target      the event target to listen on
 * @param {function}     callback    the event callback to attach
 * @param {boolean}      [debounce]  whether to debounce the event or not, defaults to false
 */
app.on = function(eventNames, target, callback, debounce) {
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
  events = events || {};

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

app.charts = {
  configure: function() {
    app.Charts.defaults.global.spanGaps                            = false;
    app.Charts.defaults.global.defaultFontFamily                   = "'Brandon Grotesque', 'Roboto', 'Lucida Grande', 'Verdana', sans-serif";
    app.Charts.defaults.global.defaultFontSize                     = 14;
    app.Charts.defaults.global.elements.line.tension               = 0;
    app.Charts.defaults.global.elements.line.fill                  = true;
    app.Charts.defaults.global.elements.line.borderJoinStyle       = 'round';
    app.Charts.defaults.global.elements.line.borderCapStyle        = 'butt';
    app.Charts.defaults.global.elements.line.borderDash            = [];
    app.Charts.defaults.global.elements.line.borderDashOffset      = 0.0;
    app.Charts.defaults.global.elements.point.radius               = 2;
    app.Charts.defaults.global.elements.point.hitRadius            = 10;
    app.Charts.defaults.global.elements.point.borderWidth          = 3;
    app.Charts.defaults.global.elements.point.hoverRadius          = 4;
    app.Charts.defaults.global.elements.point.hoverBorderWidth     = 3;
    app.Charts.defaults.global.elements.point.hoverBackgroundColor = "#fff";
    app.Charts.defaults.global.tooltips.mode                       = 'single';
    app.Charts.defaults.global.tooltips.titleFontSize              = 16;
    app.Charts.defaults.global.tooltips.bodySpacing                = 6;
    app.Charts.defaults.global.tooltips.titleMarginBottom          = 16;
    app.Charts.defaults.global.tooltips.cornerRadius               = 4;
    app.Charts.defaults.global.tooltips.caretSize                  = 8;
    app.Charts.defaults.global.tooltips.xPadding                   = 10;
    app.Charts.defaults.global.tooltips.yPadding                   = 10;
  },

  prepare: function(container, id, data) {
    var canvas;

    /**
     * use existing canvas or create a new one
     */
    if (container.getElementsByTagName('canvas').length !== 0) {
      canvas = container.getElementsByTagName('canvas')[ 0 ];
    } else {

      // create a new chart canvas
      canvas = app.helpers.createNode('canvas', {
        class:  'chart',
        id:     'id',
        width:  container.offsetWidth,
        height: container.offsetHeight
      });

      // append canvas to the container
      container.appendChild(canvas);
    }

    return new app.Charts(canvas.getContext('2d'), data);
  },

  line: function(container, id, data) {
    return this.prepare(container, id, {
      type:    'line',
      data:    data,
      options: {
        scales: {
          yAxes: [ {
            ticks: {
              beginAtZero: true
            }
          } ]
        }
      }
    });
  }
};

/**
 * modal abstraction
 *
 * @returns {VanillaModal}  the modal instance
 */
app.modals = {
  instance: null,

  configure: function() {
    // append the modal template, if not yet present
    if (!document.querySelector('.modal-overlay')) {
      document.body.appendChild(app.templates.baseModalTemplate);
    }

    // create a new modal with the merged configuration data and store it
    return app.modals.instance = new app.Modals({
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
  }
};

app.templates.baseModalTemplate = app.helpers.createElement('<div class="modal-overlay">' +
  '<div class="modal">' +
  '<button type="button" class="seamless" data-close-modal><span class="fa fa-times"></span></button>' +
  '<article class="modal-content"></article>' +
  '</div>' +
  '</div>');

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
      app.notifications = notifications;

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

      app.Charts = require('./libraries/chart/chart');
      app.charts.configure();

      app.Modals = require('./libraries/vanilla-modal');
      app.modals.configure();

      app.elements.overlay = document.getElementById('overlay');
      app.connectors.getConfig(function() {
        window.debug = app.config.debug;
        if (window.debug) {
          app.debug = console.debug.bind(console);
        } else {
          app.debug = function() {
            console.log('debugging disabled');
          }
        }

        app.translator = translator;
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
      window.addEventListener('app:ready', function(event) {
        console.log('app ready!');
      });
      window.dispatchEvent(new Event('app:ready'));
    } catch (error) {
      return app.error(error, '[[clientError:while_dependencies]]');
    }
  });
};
