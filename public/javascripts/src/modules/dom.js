'use strict';

module.exports = function(app) {

  /**
   *
   * @param {string|Array|Element|HTMLElement|Node|HTMLCollection|NodeList} selectors
   *
   * @returns {Array}
   * @private
   */
  function _covertToSelectorArray (selectors) {

    // if we have not received a list of selectors, convert it
    if (
      (!selectors instanceof NodeList) ||
      (!selectors instanceof HTMLCollection) ||
      (typeof selectors !== 'Array')
    ) {
      selectors = [ selectors ];
    }

    // if selectors is not an array, convert it
    if (!selectors instanceof Array) {
      selectors = Array.prototype.slice.call(selectors);
    }

    return selectors;
  }

  /**
   *
   * @param {string|Element|HTMLElement|Node} selector
   * @returns {Element|HTMLElement|Node|Array}
   * @private
   */
  function _parseSelector (selector) {
    var elements;

    // if we received any type of DOM node, return it
    if (typeof selector === 'object' && selector.hasOwnProperty('nodeType')) {
      return selector;
    }

    // check for element collections
    if (selector instanceof NodeList || selector instanceof HTMLCollection) {
      elements = selector;
    }

    if (typeof selector === 'string') {

      // check for ID selectors
      if (selector.charAt(0) === '#') {
        return document.getElementById(selector.slice(1));
      }

      // check for tag selectors
      if (selector.match(/^([a-zA-Z]+)$/)) {
        elements = document.getElementsByTagName(selector);
      } else {

        // check for class selectors
        var classMatches = [];
        if (classMatches = selector.match(/([a-zA-Z]+)?\.(-?[_a-zA-Z0-9]+)/) && classMatches.length === 1) {

          // if we have only a single class, use getElementsByClassName
          elements = document.getElementsByClassName(classMatches[ 0 ].slice(1));

          if (elements.length === 1) {
            return elements[ 0 ];
          }
        } else {

          // in all other cases, just use querySelectorAll
          elements = document.querySelectorAll(selector);
        }
      }
    }

    // if we have multiple elements left, convert them to an array
    return Array.prototype.slice.call(elements);
  }

  app.dom = function(selectors) {
    selectors = _covertToSelectorArray(selectors);

    var elements = [];

    for (var selector = 0; selector < selectors.length; selector++) {
      elements.push(_parseSelector(selectors[ selector ]));
    }

    if (elements.length === 1) {
      return elements[ 0 ];
    }

    return elements;
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

  app.events.imageError = function(image) {
    image.onerror = '';
    image.src     = '/images/noImage.svg';
    image.classList.add('image-error');
    image.parentNode.title = 'Kein Bild verfügbar';

    return true;
  };

  app.on('error', document.getElementsByTagName('img'), app.events.imageError);
};
