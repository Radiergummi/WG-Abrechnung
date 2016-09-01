'use strict';

module.exports = function(app) {
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

  app.events.imageError = function(image) {
    image.onerror = '';
    image.src     = '/images/noImage.svg';
    image.classList.add('image-error');
    image.parentNode.title = 'Kein Bild verfügbar';

    return true;
  };

  app.on('error', document.getElementsByTagName('img'), app.events.imageError);
};
