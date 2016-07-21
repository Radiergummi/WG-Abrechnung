'use strict';

/**
 * main client app
 */
var app = {
  elements:   {},
  listeners:  {},
  events:     {},
  helpers:    {},
  connectors: {},
  templates:  {},
  startup:    [],
  config:     {}
};

app.helpers.createNode = function (tagName, attributes, content) {
  var node = document.createElement(tagName);

  attributes = attributes || {};

  for (var attr in attributes) {
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

app.helpers.createElement = function (elementString) {
  var parser = new DOMParser();

  return parser.parseFromString(elementString, 'text/html').body.childNodes[ 0 ];
};

/**
 * Debounce function from https://davidwalsh.name/javascript-debounce-function
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */
app.helpers.debounce = function (func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later   = function () {
      timeout = null;
      if (! immediate) func.apply(context, args);
    };
    var callNow = immediate && ! timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

app.connectors.getConfig = function (callback) {
  app.io.emit('app.getConfig', function (error, data) {
    if (error) {
      return console.error(error);
    }

    app.config = data;

    return callback();
  });
};

app.events.imageError = function (image) {
  image.onerror = '';
  image.src     = '/images/noImage.svg';
  image.classList.add('image-error');
  image.parentNode.title = 'Kein Bild verfügbar';

  return true;
};

app.charts = {
  prepare: function (container, id, data) {
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

  line: function (container, id, data) {
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

app.init = function () {
  app.io               = io();
  app.Charts           = Chart;
  app.elements.overlay = document.getElementById('overlay');
  app.connectors.getConfig(function () {

    // call all startup scripts
    for (var i = 0; i < app.startup.length; i ++) {
      app.startup[ i ].call(app);
    }
  });
};
