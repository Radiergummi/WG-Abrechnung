'use strict';

module.exports = function (app) {

  /**
   * turns an arbitrary set of DOM nodes into an array
   *
   * @param {Array|HTMLCollection|NodeList|Element|HTMLElement|Node} elements
   *
   * @returns {Array}
   * @private
   */
  function _covertToElementArray(elements) {

    // if we have not received a list of selectors, convert it
    if (
      elements instanceof Element ||
      elements instanceof HTMLElement ||
      elements instanceof Node
    ) {
      return [ elements ];
    }

    if (elements.hasOwnProperty('length') && elements.length === 1) {
      return [ elements[ 0 ] ];
    }

    // if selectors is not an array, convert it
    if (typeof elements !== 'Array') {
      return Array.prototype.slice.call(elements);
    }
  }

  /**
   * parses a selector string
   *
   * @param {string|Element|HTMLElement|Node} selector
   * @returns {Array}
   * @private
   */
  function _parseSelector(selector) {

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

  /**
   * constructor for the DOM Element abstractor
   *
   * @param {Array} elementSet
   * @returns {_DOMElement}
   * @private
   */
  function _DOMElement(elementSet) {
    this.elementSet = elementSet;

    for (var i = 0; i < elementSet.length; i ++) {
      this[ i ] = elementSet[ i ];
    }

    this.length = {
      get: function() {
        var count = 0,
            idx   = 0;

        while (this[ idx ]) {
          count++;
          idx++;
        }

        return count;
      }
    };

    // return all elements
    return this;
  }

  /**
   * defines the DOMElement class prototype
   * 
   * @type {{length: number, splice: _DOMElement.splice}}
   */
  _DOMElement.prototype = {
    length: 0,
    splice: function (begin, end) {
      return this.elementSet.slice(begin, end);
    }
  };

  /**
   * iterates over each element in the current set
   * 
   * @param   {function} callback
   * @returns {_DOMElement}
   */
  _DOMElement.prototype.each = function (callback) {
    for (var index = 0; index < this.length; index ++) {
      callback.call(this, index, this.elementSet[ index ]);
    }

    return this;
  };

  /**
   * returns the last element in the set as a new dom element
   *
   * @returns {_DOMElement}
   */
  _DOMElement.prototype.first = function () {
    return new _DOMElement([ this.elementSet[ 0 ] ]);
  };

  /**
   * returns the first element in the set as a new dom element
   * 
   * @returns {_DOMElement}
   */
  _DOMElement.prototype.last = function () {
    return new _DOMElement([ this.elementSet[ this.length - 1 ] ]);
  };

  /**
   * attaches an event listener using the apps event framework
   *
   * @param {string}   eventNames
   * @param {function} [callback]
   * @param {object}   [options]
   */
  _DOMElement.prototype.on = function (eventNames, callback, options) {
    return this.each(function() {
      return app.on(eventNames, this, callback, options);
    });
  };

  /**
   * removes an event listener using the apps event framework
   *
   * @param {string}   eventNames
   * @param {function} [callback]
   */
  _DOMElement.prototype.off = function (eventNames, callback) {
    return this.each(function() {
      return app.off(eventNames, this, callback);
    });
  };

  /**
   * adds a class
   *
   * @param   {string} className
   * @returns {_DOMElement}
   */
  _DOMElement.prototype.addClass = function(className) {
    return this.each(function() {
      return this.classList.add(className);
    });
  };

  /**
   * removes a class
   *
   * @param   {string} className
   * @returns {_DOMElement}
   */
  _DOMElement.prototype.removeClass = function(className) {
    return this.each(function() {
      return this.classList.remove(className);
    });
  };

  /**
   * toggles a class
   *
   * @param   {string} className
   * @returns {_DOMElement}
   */
  _DOMElement.prototype.toggleClass = function(className) {
    return this.each(function() {
      return this.classList.toggle(className);
    });
  };

  /**
   * wrapper function for the DOM library (minimal jQuery-like interface)
   *
   * @param   {*} selector
   * @returns {*}
   */
  app.dom = function (selector) {
    if (!selector) {
      return this;
    }

    var elements = _parseSelector(selector);
    return new _DOMElement(elements);
  };

  app.helpers.createNode = function (tagName, attributes, content) {
    var node = document.createElement(tagName);

    attributes = attributes || {};

    for (var attr in attributes) {
      if (! attributes.hasOwnProperty(attr)) {
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

  app.helpers.createElement = function (elementString) {
    var parser = new DOMParser();

    return parser.parseFromString(elementString, 'text/html').body.childNodes[ 0 ];
  };

  app.helpers.createTranslatedElement = function (elementString) {
    var parser = new DOMParser();

    return new Promise(function (resolve) {
      app.translator.translate(elementString, app.config.language, function (translatedElementString) {
        resolve(parser.parseFromString(translatedElementString, 'text/html').body.childNodes[ 0 ]);
      });
    });
  };

  app.events.imageError = function (image) {
    image.onerror = '';
    image.src     = '/images/noImage.svg';
    image.classList.add('image-error');
    image.parentNode.title = 'Kein Bild verfügbar';

    return true;
  };

  app.on('error', document.getElementsByTagName('img'), app.events.imageError);
};
