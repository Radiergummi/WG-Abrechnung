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
      app.translator.translate(friendlyMessage, document.documentElement.lang, function(translated) {
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

app.modals = {};

/**
 * modal abstraction. retrieves a named modal from the modals object or creates a new one.
 *
 * @param {string} name       the modal name
 * @param {object} [options]  optional object with modal creation objects
 * @returns {VanillaModal}    the modal instance
 */
app.modal  = function(name, options) {

  // look up the name in the modal storage
  if (app.modals.hasOwnProperty(name)) {

    // if found, return the instance
    return app.modals.modals[ name ];
  }

  // create a new modal and store it
  app.modals[ name ] = new app.Modals(options);

  // return the stored instance
  return app.modals[ name ];
};

app.events.onServerUpdate = function() {
  app.translator.translate('[[global:server_updated.message]]|[[global:server_updated.reload]]|[[global:server_updated.later]]', document.documentElement.lang, function(translated) {
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

      app.io     = io();
      app.Charts = Chart;
      app.Modals = VanillaModal;
      app.charts.configure();
      app.elements.overlay = document.getElementById('overlay');
      app.connectors.getConfig(function() {
        window.debug   = app.config.debug;
        app.translator = translator;

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
        console.log('app ready!')
      });
      window.dispatchEvent(new Event('app:ready'));
    } catch (error) {
      return app.error(error, '[[clientError:while_dependencies]]');
    }
  });
};
