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

app.connectors.getConfig = function(callback) {
  app.io.emit('app.getConfig', function(error, data) {
    if (error) {
      return console.error(error);
    }

    app.config = data;

    return callback();
  });
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
