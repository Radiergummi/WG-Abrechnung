/**
 * LICENSE
 *
 The MIT License (MIT)

 Copyright (c) 2015 Phuse

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 @see https://github.com/thephuse/vanilla-modal
 */
(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define('VanillaModal', [ 'module', 'exports' ], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.VanillaModal = mod.exports;
  }
})(this, function(module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function(obj) {
    return typeof obj;
  }
    : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  function _classCallCheck (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function() {
    function defineProperties (target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor          = props[ i ];
        descriptor.enumerable   = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var VanillaModal = function() {

    /**
     * @param {Object} [userSettings]
     */
    function VanillaModal (userSettings) {
      _classCallCheck(this, VanillaModal);

      this.$$ = {
        modal:         '.modal',
        modalInner:    '.modal-inner',
        modalContent:  '.modal-content',
        open:          '[rel="modal:open"]',
        close:         '[rel="modal:close"]',
        page:          'body',
        class:         'modal-visible',
        loadClass:     'vanilla-modal',
        clickOutside:  true,
        closeKeys:     [ 27 ],
        transitions:   true,
        transitionEnd: null,
        onBeforeOpen:  null,
        onBeforeClose: null,
        onOpen:        null,
        onClose:       null
      };

      this._applyUserSettings(userSettings);
      this.error            = false;
      this.isOpen           = false;
      this.current          = null;
      this.open             = this._open.bind(this);
      this.close            = this._close.bind(this);
      this.$$.transitionEnd = this._transitionEndVendorSniff();
      this.$                = this._setupDomNodes();

      if (!this.error) {
        this.$.page.classList.add(this.$$.loadClass);


        this._events().add();
      } else {
        console.error('Please fix errors before proceeding.');
      }
    }

    /**
     * @param {Object} userSettings
     */
    _createClass(VanillaModal, [ {
      key:   '_applyUserSettings',
      value: function _applyUserSettings (userSettings) {
        if ((typeof userSettings === 'undefined' ? 'undefined' : _typeof(userSettings)) === 'object') {
          for (var i in userSettings) {
            if (userSettings.hasOwnProperty(i)) {
              this.$$[ i ] = userSettings[ i ];
            }
          }
        }
      }
    }, {
      key:   '_transitionEndVendorSniff',
      value: function _transitionEndVendorSniff () {
        if (this.$$.transitions === false) return;
        var el          = document.createElement('div');
        var transitions = {
          'transition':       'transitionend',
          'OTransition':      'otransitionend',
          'MozTransition':    'transitionend',
          'WebkitTransition': 'webkitTransitionEnd'
        };
        for (var i in transitions) {
          if (transitions.hasOwnProperty(i) && el.style[ i ] !== undefined) {
            return transitions[ i ];
          }
        }
      }
    }, {
      key:   '_getNode',
      value: function _getNode (selector, parent) {
        if (selector instanceof HTMLElement) {
          return selector;
        }

        var targetNode = parent || document;
        var node       = targetNode.querySelector(selector);
        if (!node) {
          this.error = true;

          return console.error(selector + ' not found in document.');
        }

        return node;
      }
    }, {
      key:   '_setupDomNodes',
      value: function _setupDomNodes () {
        var $          = {};
        $.modal        = this._getNode(this.$$.modal);
        $.page         = this._getNode(this.$$.page);
        $.modalInner   = this._getNode(this.$$.modalInner, this.modal);
        $.modalContent = this._getNode(this.$$.modalContent, this.modal);
        return $;
      }
    }, {
      key:   '_setOpenId',
      value: function _setOpenId () {
        var id = this.current.id || 'anonymous';
        this.$.page.setAttribute('data-current-modal', id);
      }
    }, {
      key:   '_removeOpenId',
      value: function _removeOpenId () {
        this.$.page.removeAttribute('data-current-modal');
      }
    }, {
      key:   '_getElementContext',
      value: function _getElementContext (e) {
        if (e && typeof e.hash === 'string') {
          return document.querySelector(e.hash);
        } else if (typeof e === 'string') {
          return document.querySelector(e);
        } else {
          return console.error('No selector supplied to open()');
        }
      }
    }, {
      key:   '_open',
      value: function _open (matches, e) {
        this._releaseNode();
        this.current = this._getElementContext(matches);
        if (this.current instanceof HTMLElement === false) return console.error('VanillaModal target must exist on page.');
        if (typeof this.$$.onBeforeOpen === 'function') this.$$.onBeforeOpen.call(this, e);
        this._captureNode();
        this.$.page.classList.add(this.$$.class);
        this._setOpenId();
        this.isOpen = true;
        if (typeof this.$$.onOpen === 'function') this.$$.onOpen.call(this, e);
      }
    }, {
      key:   '_detectTransition',
      value: function _detectTransition () {
        var css                = window.getComputedStyle(this.$.modal, null);
        var transitionDuration = [ 'transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration' ];
        var hasTransition      = transitionDuration.filter(function(i) {
          if (typeof css[ i ] === 'string' && parseFloat(css[ i ]) > 0) {
            return true;
          }
        });
        return hasTransition.length ? true : false;
      }
    }, {
      key:   '_close',
      value: function _close (e) {
        if (this.isOpen === true) {
          this.isOpen = false;
          if (typeof this.$$.onBeforeClose === 'function') this.$$.onBeforeClose.call(this, e);
          this.$.page.classList.remove(this.$$.class);
          var transitions = this._detectTransition();
          if (this.$$.transitions && this.$$.transitionEnd && transitions) {
            this._closeModalWithTransition(e);
          } else {
            this._closeModal(e);
          }
        }
      }
    }, {
      key:   '_closeModal',
      value: function _closeModal (e) {
        this._removeOpenId(this.$.page);
        this._releaseNode();
        this.isOpen  = false;
        this.current = null;
        if (typeof this.$$.onClose === 'function') this.$$.onClose.call(this, e);
      }
    }, {
      key:   '_closeModalWithTransition',
      value: function _closeModalWithTransition (e) {
        var _closeTransitionHandler = function() {
          this.$.modal.removeEventListener(this.$$.transitionEnd, _closeTransitionHandler);
          this._closeModal(e);
        }.bind(this);
        this.$.modal.addEventListener(this.$$.transitionEnd, _closeTransitionHandler);
      }
    }, {
      key:   '_captureNode',
      value: function _captureNode () {
        if (this.current) {
          while (this.current.childNodes.length > 0) {
            this.$.modalContent.appendChild(this.current.childNodes[ 0 ]);
          }
        }
      }
    }, {
      key:   '_releaseNode',
      value: function _releaseNode () {
        if (this.current) {
          while (this.$.modalContent.childNodes.length > 0) {
            this.current.appendChild(this.$.modalContent.childNodes[ 0 ]);
          }
        }
      }
    }, {
      key:   '_closeKeyHandler',
      value: function _closeKeyHandler (e) {
        if (Object.prototype.toString.call(this.$$.closeKeys) !== '[object Array]' || this.$$.closeKeys.length === 0) return;
        if (this.$$.closeKeys.indexOf(e.which) > -1 && this.isOpen === true) {
          e.preventDefault();
          this.close(e);
        }
      }
    }, {
      key:   '_outsideClickHandler',
      value: function _outsideClickHandler (e) {
        if (this.$$.clickOutside !== true) return;
        var node = e.target;
        while (node && node != document.body) {
          if (node === this.$.modalInner) return;
          node = node.parentNode;
        }
        this.close(e);
      }
    }, {
      key:   '_matches',
      value: function _matches (e, selector) {
        var el      = e.target;
        var matches = (el.document || el.ownerDocument).querySelectorAll(selector);
        for (var i = 0; i < matches.length; i++) {
          var child = el;
          while (child && child !== document.body) {
            if (child === matches[ i ]) return child;
            child = child.parentNode;
          }
        }
        return null;
      }
    }, {
      key:   '_delegateOpen',
      value: function _delegateOpen (e) {
        var matches = this._matches(e, this.$$.open);
        if (matches) {
          e.preventDefault();
          e.delegateTarget = matches;
          return this.open(matches, e);
        }
      }
    }, {
      key:   '_delegateClose',
      value: function _delegateClose (e) {
        if (this._matches(e, this.$$.close)) {
          e.preventDefault();
          return this.close(e);
        }
      }
    }, {
      key:   '_events',
      value: function _events () {

        var _closeKeyHandler     = this._closeKeyHandler.bind(this);
        var _outsideClickHandler = this._outsideClickHandler.bind(this);
        var _delegateOpen        = this._delegateOpen.bind(this);
        var _delegateClose       = this._delegateClose.bind(this);

        var add = function add () {
          this.$.modal.addEventListener('click', _outsideClickHandler, false);
          document.addEventListener('keydown', _closeKeyHandler, false);
          document.addEventListener('click', _delegateOpen, false);
          document.addEventListener('click', _delegateClose, false);
        };

        this.destroy = function() {
          this.close();
          this.$.modal.removeEventListener('click', _outsideClickHandler);
          document.removeEventListener('keydown', _closeKeyHandler);
          document.removeEventListener('click', _delegateOpen);
          document.removeEventListener('click', _delegateClose);
        };

        return {
          add: add.bind(this)
        };
      }
    } ]);

    return VanillaModal;
  }();

  exports.default = VanillaModal;
  module.exports  = exports[ 'default' ];
});
'use strict';

