'use strict';

module.exports = function(app) {

  /**
   *
   * @param {Array|Element|HTMLElement|Node|HTMLCollection|NodeList} elements
   *
   * @returns {Array}
   * @private
   */
  function _covertToElementArray (elements) {

    // if we have not received a list of selectors, convert it
    if (!elements.hasOwnProperty('length')) {
      elements = [ elements ];
    }

    // if selectors is not an array, convert it
    if (typeof elements !== 'Array') {
      elements = Array.prototype.slice.call(elements);
    }

    return elements;
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
      return _covertToElementArray(selector);
    }

    // check for element collections
    if (selector instanceof NodeList || selector instanceof HTMLCollection) {
      return _covertToElementArray(selector);
    }

    if (typeof selector === 'string') {

      // check for ID selectors
      if (selector.charAt(0) === '#') {
        return _covertToElementArray(document.getElementById(selector.slice(1)));
      }

      // check for tag selectors
      if (selector.match(/^([a-zA-Z]+)$/)) {
        return _covertToElementArray(document.getElementsByTagName(selector));
      }


      // check for class selectors
      var classMatches = [];
      if (classMatches = selector.match(/([a-zA-Z]+)?\.([-_a-zA-Z0-9]+)/g)) {
        if (classMatches.length === 1) {

          // if we have only a single class, use getElementsByClassName
          return _covertToElementArray(document.getElementsByClassName(classMatches[ 0 ].slice(1)));
        }
      }
    }

    // in all other cases, just use querySelectorAll
    return _covertToElementArray(document.querySelectorAll(selector));
  }

  function _DOMElement (elementSet) {
    console.log(elementSet);
    this.elementSet = elementSet;

    for (var i = 0; i < elementSet.length; i++) {
      this[ i ] = elementSet[ i ];
    }

    this.length = elementSet.length;

    // return all elements
    return this;
  }

  _DOMElement.prototype = {
    length: 0,
    splice: function(begin, end) {
      return this.elementSet.slice(begin, end);
    }
  };
/*
  Object.defineProperty(_DOMElement.prototype, 'length', {
    get: function() {
      var count = 0,
          idx   = 0;

      while (this[ idx ]) {
        count++;
        idx++;
      }

      return count;
    }
  });
*/
  _DOMElement.prototype.each = function(callback) {
    for (var index = 0; index < this.elementSet; index++) {
      callback.call(this, this.elementSet[ index ], index);
    }
  };

  _DOMElement.prototype.on = function(eventNames, callback, options) {
    return app.on(eventNames, this, callback, options);
  };

  _DOMElement.prototype.off = function(eventNames, callback) {
    return app.off(eventNames, this, callback);
  };

  app.dom = function(selector) {
    return new _DOMElement(_parseSelector(selector));
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
