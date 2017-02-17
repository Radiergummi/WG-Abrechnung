'use strict';

module.exports = function(app) {

  /**
   * turns an arbitrary set of DOM nodes into an array
   *
   * @param {Array|HTMLCollection|NodeList|Element|HTMLElement|Node} elements
   *
   * @returns {Array}
   * @private
   */
  function _covertToElementArray (elements) {

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
   * @param {string|Element|HTMLElement|Node|HTMLCollection|NodeList|Array} selector
   * @param {object|document|DOMElement} [context]
   * @returns {Array}
   * @private
   */
  function _parseSelector (selector, context) {

    // default context to the document object
    context = context || document;

    // if the context passed is a DOMElement, use its first node as context
    if (context.isDOMElement) {
      context = context[ 0 ];
    }

    if (Array.isArray(selector)) {
      return selector;
    }

    // if we received any type of DOM node, return it
    if (typeof selector === 'object' && selector.nodeType === 1) {
      return _covertToElementArray(selector);
    }

    // check for element collections
    if (selector instanceof NodeList || selector instanceof HTMLCollection) {
      return _covertToElementArray(selector);
    }

    // in all other cases, just use querySelectorAll
    return _covertToElementArray(context.querySelectorAll(selector));
  }

  /**
   * constructor for the DOM Element abstractor
   *
   * @param {string|Element|HTMLElement|Node|HTMLCollection|NodeList|Array} selector
   * @param {object|document|DOMElement} [context]
   * @returns {DOMElement}
   * @private
   */
  const DOMElement = function DOMElement (selector, context) {
    this.elementSet       = _parseSelector(selector, context);
    this.originalSelector = selector;

    for (var i = 0; i < this.elementSet.length; i++) {
      this[ i ] = this.elementSet[ i ];
    }

    // return all elements
    return this;
  };

  /**
   * defines the DOMElement class prototype
   *
   * @type {{length: number, splice: DOMElement.splice}}
   */
  DOMElement.prototype = {
    constructor:  DOMElement,
    length:       0,
    splice:       function(begin, end) {
      return this.elementSet.slice(begin, end);
    },
    toString:     function() {
      return '[object DOMElement]'
    },
    isDOMElement: true
  };

  Object.defineProperty(DOMElement.prototype, 'length', {
    get: function() {
      var count = 0, idx = 0;

      while (this[ idx ]) {
        count++;
        idx++;
      }

      return count;
    }
  });

  DOMElement.prototype.map = function(callback) {
    return this.elementSet.map(callback);
  };

  DOMElement.prototype.filter = function(callback) {
    return this.elementSet.filter(callback);
  };

  /**
   * iterates over each element in the current set
   *
   * @param   {function} callback
   * @returns {DOMElement}
   */
  DOMElement.prototype.each = function(callback) {
    for (let index = 0; index < this.elementSet.length; index++) {
      if (typeof this.elementSet[ index ] === 'undefined') {
        continue;
      }

      callback.call(this, index, this.elementSet[ index ]);
    }

    return this;
  };

  DOMElement.prototype.empty = function() {
    return (this.elementSet.length === 0);
  };

  /**
   * returns the last element in the set as a new dom element
   *
   * @returns {DOMElement}
   */
  DOMElement.prototype.first = function() {
    return new DOMElement([ this.elementSet[ 0 ] ]);
  };

  /**
   * returns the first element in the set as a new dom element
   *
   * @returns {DOMElement}
   */
  DOMElement.prototype.last = function() {
    return new DOMElement([ this.elementSet[ this.length - 1 ] ]);
  };

  DOMElement.prototype.at = function(position) {
    return new DOMElement([ this.elementSet[ position ] ]);
  };

  /**
   * returns an elements children
   *
   * @param [selector]
   * @returns {DOMElement}
   */
  DOMElement.prototype.children = function(selector) {
    if (!selector) {
      return new DOMElement(this.elementSet[ 0 ].children);
    } else {
      return new DOMElement(selector, this);
    }
  };

  /**
   * attaches an event listener using the apps event framework
   *
   * @param {string}   eventNames
   * @param {function} [callback]
   * @param {object}   [options]
   */
  DOMElement.prototype.on = function(eventNames, callback, options) {
    return this.each((index, element) => app.on(eventNames, element, callback, options));
  };

  /**
   * removes an event listener using the apps event framework
   *
   * @param {string}   eventNames
   * @param {function} [callback]
   */
  DOMElement.prototype.off = function(eventNames, callback) {
    return this.each((index, element) => app.off(eventNames, element, callback));
  };

  /**
   * triggers an event listener using the apps event framework
   *
   * @param eventNames
   * @param data
   * @returns {DOMElement}
   */
  DOMElement.prototype.trigger = function(eventNames, data) {
    return this.each((index, element) => app.trigger(eventNames, element, data));
  };

  /**
   * adds a class
   *
   * @param   {string} className
   * @returns {DOMElement}
   */
  DOMElement.prototype.addClass = function(className) {
    return this.each((index, element) => element.classList.add(className));
  };

  /**
   * removes a class
   *
   * @param   {string} className
   * @returns {DOMElement}
   */
  DOMElement.prototype.removeClass = function(className) {
    return this.each((index, element) => element.classList.remove(className));
  };

  /**
   * toggles a class
   *
   * @param   {string} className
   * @returns {DOMElement}
   */
  DOMElement.prototype.toggleClass = function(className) {
    return this.each((index, element) => element.classList.toggle(className));
  };

  /**
   * allows to get or set the ID of an element
   *
   * @param   [id] an optional ID to apply to the first matched element
   * @returns {string|DOMElement}
   */
  DOMElement.prototype.id = function(id) {
    if (typeof id === 'undefined') {
      return this.elementSet[ 0 ].id;
    }

    this.elementSet[ 0 ].id = id;

    return this;
  };

  DOMElement.prototype.value = function(value) {
    if (typeof value === 'undefined') {
      return this.elementSet[ 0 ].value;
    }

    return this.each(function(index, element) {
      return element.value = value;
    });
  };

  DOMElement.prototype.src = function(source) {
    if (typeof source === 'undefined') {
      return this.elementSet[ 0 ].source;
    }

    return this.each(function(index, element) {
      return element.src = source;
    });
  };

  DOMElement.prototype.selected = function(selected) {
    return this.each((index, element) => element.selected = selected);
  };

  /**
   * allows to get or set the text content of an element
   *
   * @param   {string}            [text] the text to set
   * @returns {DOMElement|string}
   */
  DOMElement.prototype.text = function(text) {
    if (typeof text === 'undefined') {
      return this.elementSet[ 0 ].textContent;
    }

    return this.each((index, element) => element.textContent = text);
  };

  DOMElement.prototype.data = function(key, value) {
    if (!value) {
      return this.elementSet[ 0 ].dataset[ key ];
    }

    return this.each(function(index, element) {
      return element.dataset[ key ] = value;
    });
  };

  DOMElement.prototype.attribute = function(key, value) {
    if (typeof value === 'undefined') {
      return this.elementSet[ 0 ].getAttribute(key);
    }

    return this.each(function(index, element) {
      return element.setAttribute(key, value);
    });
  };

  DOMElement.prototype.html = function(html) {
    if (typeof html === 'undefined') {
      return this.elementSet[ 0 ].innerHTML;
    }

    return this.each((index, element) => element.innerHTML = html);
  };

  DOMElement.prototype.remove = function() {
    return this.each((index, element) => element.remove());
  };

  DOMElement.prototype.contains = function(element) {
    if (element.isDOMElement) {
      element = element.elementSet[ 0 ];
    }

    return this.elementSet[ 0 ].contains(element);
  };

  DOMElement.prototype.append = function(element) {
    if (element.isDOMElement) {
      element = element.elementSet[ 0 ];
    }

    this.elementSet[ 0 ].appendChild(element);
  };

  /**
   * retrieves the first elements tag name
   *
   * @returns {string}
   */
  DOMElement.prototype.getTagName = function() {
    return this.elementSet[ 0 ].tagName.toLowerCase();
  };

  /**
   * checks if an element is a certain node type
   *
   * @param   {string}  type the node type, eg. "div", "li" or "textarea"
   * @returns {boolean}
   */
  DOMElement.prototype.is = function(type) {
    return (this.getTagName() === type.toLowerCase());
  };

  /**
   * checks whether an element is a kind of input element
   *
   * @returns {boolean}
   */
  DOMElement.prototype.isInput = function() {
    const elementType = this.getTagName();

    return ([
      'input',
      'select',
      'textarea',
      'button'
    ].indexOf(elementType) !== -1);
  };

  /**
   * wrapper function for the DOM library (minimal jQuery-like interface)
   *
   * @param   {string|Array|Node|Element|HTMLElement|HTMLCollection|NodeList} selector
   * @param   {object|DOMElement}                                             [context]
   * @returns {DOMElement}
   */
  app.dom = function(selector, context) {

    // without a selector, return an empty DOMElement
    if (!selector) {
      return new DOMElement([]);
    }

    // parse the selector in its individual context
    return new DOMElement(selector, context);
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
    const parser = new DOMParser();

    return app.translate(elementString)
      .then(translatedElementString =>
        parser.parseFromString(translatedElementString, 'text/html').body.childNodes[ 0 ]
      );
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
