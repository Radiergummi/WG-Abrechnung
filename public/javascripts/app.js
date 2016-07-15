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
  config: {}
};

app.helpers.createNode = function(tagName, attributes, content) {
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

app.helpers.createElement = function(elementString) {
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
app.helpers.debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
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
  image.src = '/images/noImage.svg';
  image.classList.add('image-error');
  image.parentNode.title = 'Kein Bild verfügbar';

  return true;
};

app.init = function() {
  app.io = io();
  app.elements.overlay = document.getElementById('overlay');
  app.connectors.getConfig(function() {

    // call all startup scripts
    for (var i = 0; i < app.startup.length; i++) {
      app.startup[ i ].call(app);
    }
  });
};
