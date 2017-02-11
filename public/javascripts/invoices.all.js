webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app  = __webpack_require__(1),
	    main = __webpack_require__(66)(app);
	
	(function(app) {
	  app.startup.push(function() {
	    __webpack_require__(67)(app);
	
	    app.elements.invoicesContainer    = document.getElementsByClassName('invoices')[ 0 ];
	    app.elements.invoices             = app.elements.invoicesContainer.getElementsByClassName('invoice');
	    app.elements.lastInvoice          = app.elements.invoices[ app.elements.invoices.length - 1 ];
	    app.elements.deleteInvoiceButtons = app.dom('.delete-invoice');
	
	    app.listeners.addInvoicesEvents = function() {
	      app.on('DOMContentLoaded', app.events.lastInvoiceVisible, { debounce: true });
	      app.on('load', app.events.lastInvoiceVisible, { debounce: true });
	      app.on('scroll', app.events.lastInvoiceVisible, { debounce: true });
	      app.on('resize', app.events.lastInvoiceVisible, { debounce: true });
	
	//      app.elements.lastInvoice.addEventListener();
	    };
	
	
	    /**
	     * attaches the delete user event listeners
	     */
	    app.listeners.addDeleteInvoiceEvents = function() {
	      app.elements.deleteInvoiceButtons.on('click', app.events.deleteInvoice);
	    };
	
	    app.listeners.removeInvoiceEvents = function() {
	      app.off('DOMContentLoaded', app.events.lastInvoiceVisible);
	      app.off('load', app.events.lastInvoiceVisible);
	      app.off('scroll', app.events.lastInvoiceVisible);
	      app.off('resize', app.events.lastInvoiceVisible);
	    };
	
	    app.events.lastInvoiceVisible = function(event) {
	      var invoices    = app.elements.invoicesContainer.getElementsByClassName('invoice'),
	          lastInvoice = invoices[ invoices.length - 1 ];
	
	      return app.helpers.onVisibilityChange(lastInvoice, function(visibility) {
	        return app.connectors.getMoreInvoices();
	      })();
	    };
	
	
	    /**
	     * prepares the delete invoice modal
	     *
	     * @param {Event} event
	     */
	    app.events.prepareDeleteInvoiceModal = function(event) {
	      app.debug('attaching prepare delete invoice modal data');
	      let modal = app.dom('.dialog-delete-invoice-wrapper')[ 0 ];
	
	      // pass the id of the user to delete on to the real delete button
	      app.dom('.delete-invoice', modal).data('invoiceId', event.target.dataset.invoiceId);
	    };
	
	    /**
	     * deletes an invoice via sockets
	     *
	     * @param {Event} event
	     */
	    app.events.deleteInvoice = function(event) {
	      event.preventDefault();
	
	      app.connectors.deleteInvoice(event.target.dataset.invoiceId, function(error, deletedInvoice) {
	        if (error) {
	
	          // if we have an error, show a notification
	          app.notifications.error('[[settings:user_management.delete.notification_error, ' + error.message + ']]');
	
	          // log the full error to the console
	          console.error(error);
	
	          // close the modal
	          return setTimeout(app.modals.instance.close, 500);
	        }
	
	        // everything went smoothly, show a notification
	        app.translate(
	          '[[settings:user_management.delete.notification_success, ' + deletedInvoice.firstName + ' ' + deletedInvoice.lastName + ']]',
	          function(translated) {
	            app.notifications.success(translated);
	          });
	
	        return setTimeout(function() {
	          app.modals.instance.close();
	
	          // delete the user row
	          app.dom('#' + deletedInvoice._id).remove();
	        }, 500);
	      });
	    };
	
	
	    app.helpers.isElementInViewport = function(element) {
	      var rect = element.getBoundingClientRect();
	
	      return (
	        rect.top >= 0 &&
	        rect.left >= 0 &&
	        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
	        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	      );
	    };
	
	    app.helpers.onVisibilityChange = function(element, callback) {
	      return function() {
	        var isVisible = app.helpers.isElementInViewport(element);
	
	        //console.log('last invoice element is visible:', isVisible);
	        if (isVisible) {
	
	          if (typeof callback == 'function') {
	            return callback();
	          }
	        }
	      }
	    };
	
	
	    /**
	     * deletes an invoice via sockets
	     *
	     * @param {string} invoiceId
	     * @param {function(Error, object)} callback
	     * @returns {*}
	     */
	    app.connectors.deleteInvoice = function(invoiceId, callback) {
	      if (!invoiceId) {
	        return callback(new Error('invalid invoice ID ' + invoiceId), null);
	      }
	
	      app.io.emit('settings.deleteInvoice', invoiceId, function(error, deletedInvoice) {
	        if (error) {
	          return callback(error, null);
	        }
	
	        return callback(null, deletedInvoice);
	      });
	    };
	
	    app.connectors.getMoreInvoices = function() {
	      var page = Math.ceil((document.getElementsByClassName('invoice').length) / 2);
	
	      // remove tail element
	      app.dom('.timeline-data-available').remove();
	
	      // insert loading indicator
	      app.elements.invoicesContainer.appendChild(app.templates.invoiceTimelineLoading);
	
	      app.io.emit('invoices.getPaginated', {
	        userId:     app.config.user.id,
	        pageNumber: page,
	        pageSize:   2
	      }, function(error, invoices) {
	        if (error) {
	          return console.error(error);
	        }
	
	        // wait a second
	        setTimeout(function() {
	
	          // remove the loading indicator
	          app.dom('.timeline-loading').remove();
	
	          if (invoices.length > 0) {
	
	            var invoicePromises = [];
	
	            // iterate over invoices
	            for (var i = 0; i < invoices.length; i++) {
	
	              // insert the invoice
	              invoicePromises.push(app.templates.invoiceCard(invoices[ i ]).then(function(element) {
	
	                // insert a timeline separator
	                app.elements.invoicesContainer.appendChild(app.templates.invoiceTimelineSeparator());
	
	                app.elements.invoicesContainer.appendChild(element);
	              }));
	            }
	
	            Promise.all(invoicePromises).then(function() {
	              history.pushState(null, 'Rechnungen | Seite' + page, '/invoices/page/' + page);
	              app.elements.invoicesContainer.appendChild(app.templates.invoiceTimelineAvailabilityIndicator);
	            });
	          } else {
	            app.listeners.removeInvoiceEvents();
	            app.templates.invoiceTimelineEnd.then(function(element) {
	              app.elements.invoicesContainer.appendChild(element);
	            });
	          }
	
	        }, 1000);
	      });
	    };
	
	    app.templates.invoiceCard = (function() {
	      var userId = app.config.user.id;
	
	      return function(invoice) {
	        var template = '<article class="invoice" id="' + invoice._id + '">' +
	          '<section class="invoice-image">' +
	          '<img src="/images/invoices/' + userId + '/' + invoice._id + '.jpg" alt="Rechnung ' + invoice._id + '" onerror="app.events.imageError(this)">' +
	          '</section>' +
	          '<section class="invoice-data">' +
	          '<div class="invoice-id">' + invoice._id + '</div>' +
	          '<div class="invoice-owner">' +
	          '<div class="profile-picture">' +
	          '<img src="/images/users/' + invoice.user._id + '.jpg" alt>' +
	          '</div>' +
	          '<span class="owner-name">' + invoice.user.firstName + ' ' + invoice.user.lastName + '</span>' +
	          '</div>' +
	          '[[invoices:date]]: <span class="invoice-creation-date">' + invoice.creationDate + '</span><br>' +
	          '[[invoices:sum]]: <span class="invoice-sum">' + invoice.sum + '</span>€<br>' +
	          '<div class="tags-label">[[invoices:tags]]: </div>' +
	          '<div class="invoice-tags">';
	
	        if (invoice.tags.length && invoice.tags[ 0 ] !== null) {
	
	          app.debug('invoice has ' + invoice.tags.length + ' tags assigned');
	          for (var i = 0; i < invoice.tags.length; i++) {
	
	            app.debug(`processing tag ${invoice.tags[ i ].name}`);
	            template += `<div class="tag tag-${invoice.tags[ i ].color || 'blue'}" id="${invoice.tags[ i ]._id}"><span>${invoice.tags[ i ].name}</span></div>`;
	          }
	        } else {
	          template += '<span class="no-tags">[[invoices:no_tags]]</span>';
	        }
	
	        template += `</div></section><section class="invoice-actions"><a class="button" href="/invoices/${invoice._id}"><span class="fa fa-eye"></span> [[global:details]]</a>`;
	
	        if (invoice.ownInvoice) {
	          template += `<a class="button" href="/invoices/${invoice._id}/edit"><span class="fa fa-edit"></span> [[global:edit]]</a><a class="button danger" href="/invoices/${invoice._id}/delete"><span class="fa fa-trash-o"></span> [[global:delete]]</a>`;
	        }
	
	        template += '</section></article>';
	
	        return app.helpers.createTranslatedElement(template);
	      }
	    })();
	
	    app.templates.invoiceTimelineSeparator = function() {
	      return app.helpers.createElement('<div class="timeline-item timeline-separator timeline-within-range"></div>');
	    };
	
	    app.templates.invoiceTimelineLoading = (function() {
	      return app.helpers.createElement('<div class="timeline-item timeline-loading"></div>');
	    })();
	
	    app.templates.invoiceTimelineEnd = (function() {
	      return app.helpers.createTranslatedElement('<div class="timeline-item timeline-last" data-timeline-description="[[invoices:no_older]]"></div>');
	    })();
	
	    app.templates.invoiceTimelineAvailabilityIndicator = (function() {
	      return app.helpers.createElement('<div class="timeline-item timeline-data-available"></div>');
	    })();
	
	    app.listeners.addInvoicesEvents();
	    app.listeners.addDeleteInvoiceEvents();
	  });
	})(app);


/***/ },

/***/ 67:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function(app) {
	  var vanillaModal = __webpack_require__(68);
	
	  app.modals = {
	    instance: null
	  };
	
	  app.templates.baseModalTemplate = app.helpers.createElement('<div class="modal-overlay">' +
	    '<div class="modal">' +
	    '<button type="button" class="seamless" data-close-modal><span class="fa fa-times"></span></button>' +
	    '<article class="modal-content"></article>' +
	    '</div>' +
	    '</div>');
	
	  // append the modal template, if not yet present
	  if (!document.querySelector('.modal-overlay')) {
	    document.body.appendChild(app.templates.baseModalTemplate);
	  }
	
	  // create a new modal with the merged configuration data and store it
	  app.modals.instance = new vanillaModal({
	    modal:        '.modal-overlay',
	    modalInner:   '.modal',
	    modalContent: '.modal-content',
	    open:         '[data-open-modal]',
	    close:        '[data-close-modal]',
	    page:         'body',
	    loadClass:    'modal-root',
	    onBeforeOpen: function(event) {
	      if (app.events.hasOwnProperty(event.target.dataset.onModalOpenEvent)) {
	        app.debug('modal opener has open event callback attached');
	        app.events[ event.target.dataset.onModalOpenEvent ](event);
	      }
	    }
	  });
	};


/***/ },

/***/ 68:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.VanillaModal = mod.exports;
	  }
	})(this, function (module, exports) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	  };
	
	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  }
	
	  var _createClass = function () {
	    function defineProperties(target, props) {
	      for (var i = 0; i < props.length; i++) {
	        var descriptor = props[i];
	        descriptor.enumerable = descriptor.enumerable || false;
	        descriptor.configurable = true;
	        if ("value" in descriptor) descriptor.writable = true;
	        Object.defineProperty(target, descriptor.key, descriptor);
	      }
	    }
	
	    return function (Constructor, protoProps, staticProps) {
	      if (protoProps) defineProperties(Constructor.prototype, protoProps);
	      if (staticProps) defineProperties(Constructor, staticProps);
	      return Constructor;
	    };
	  }();
	
	  var VanillaModal = function () {
	
	    /**
	     * @param {Object} [userSettings]
	     */
	
	    function VanillaModal(userSettings) {
	      _classCallCheck(this, VanillaModal);
	
	      this.$$ = {
	        modal: '.modal',
	        modalInner: '.modal-inner',
	        modalContent: '.modal-content',
	        open: '[rel="modal:open"]',
	        close: '[rel="modal:close"]',
	        page: 'body',
	        class: 'modal-visible',
	        loadClass: 'vanilla-modal',
	        clickOutside: true,
	        closeKeys: [27],
	        transitions: true,
	        transitionEnd: null,
	        onBeforeOpen: null,
	        onBeforeClose: null,
	        onOpen: null,
	        onClose: null
	      };
	
	      this._applyUserSettings(userSettings);
	      this.error = false;
	      this.isOpen = false;
	      this.current = null;
	      this.open = this._open.bind(this);
	      this.close = this._close.bind(this);
	      this.$$.transitionEnd = this._transitionEndVendorSniff();
	      this.$ = this._setupDomNodes();
	
	      if (!this.error) {
	        this._addLoadedCssClass();
	        this._events().add();
	      } else {
	        console.error('Please fix errors before proceeding.');
	      }
	    }
	
	    /**
	     * @param {Object} userSettings
	     */
	
	
	    _createClass(VanillaModal, [{
	      key: '_applyUserSettings',
	      value: function _applyUserSettings(userSettings) {
	        if ((typeof userSettings === 'undefined' ? 'undefined' : _typeof(userSettings)) === 'object') {
	          for (var i in userSettings) {
	            if (userSettings.hasOwnProperty(i)) {
	              this.$$[i] = userSettings[i];
	            }
	          }
	        }
	      }
	    }, {
	      key: '_transitionEndVendorSniff',
	      value: function _transitionEndVendorSniff() {
	        if (this.$$.transitions === false) return;
	        var el = document.createElement('div');
	        var transitions = {
	          'transition': 'transitionend',
	          'OTransition': 'otransitionend',
	          'MozTransition': 'transitionend',
	          'WebkitTransition': 'webkitTransitionEnd'
	        };
	        for (var i in transitions) {
	          if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
	            return transitions[i];
	          }
	        }
	      }
	    }, {
	      key: '_getNode',
	      value: function _getNode(selector, parent) {
	        var targetNode = parent || document;
	        var node = targetNode.querySelector(selector);
	        if (!node) {
	          this.error = true;
	          return console.error(selector + ' not found in document.');
	        }
	        return node;
	      }
	    }, {
	      key: '_setupDomNodes',
	      value: function _setupDomNodes() {
	        var $ = {};
	        $.modal = this._getNode(this.$$.modal);
	        $.page = this._getNode(this.$$.page);
	        $.modalInner = this._getNode(this.$$.modalInner, this.modal);
	        $.modalContent = this._getNode(this.$$.modalContent, this.modal);
	        return $;
	      }
	    }, {
	      key: '_addLoadedCssClass',
	      value: function _addLoadedCssClass() {
	        this._addClass(this.$.page, this.$$.loadClass);
	      }
	    }, {
	      key: '_addClass',
	      value: function _addClass(el, className) {
	        if (el instanceof HTMLElement === false) return;
	        var cssClasses = el.className.split(' ');
	        if (cssClasses.indexOf(className) === -1) {
	          cssClasses.push(className);
	        }
	        el.className = cssClasses.join(' ');
	      }
	    }, {
	      key: '_removeClass',
	      value: function _removeClass(el, className) {
	        if (el instanceof HTMLElement === false) return;
	        var cssClasses = el.className.split(' ');
	        if (cssClasses.indexOf(className) > -1) {
	          cssClasses.splice(cssClasses.indexOf(className), 1);
	        }
	        el.className = cssClasses.join(' ');
	      }
	    }, {
	      key: '_setOpenId',
	      value: function _setOpenId() {
	        var id = this.current.id || 'anonymous';
	        this.$.page.setAttribute('data-current-modal', id);
	      }
	    }, {
	      key: '_removeOpenId',
	      value: function _removeOpenId() {
	        this.$.page.removeAttribute('data-current-modal');
	      }
	    }, {
	      key: '_getElementContext',
	      value: function _getElementContext(e) {
	        if (e && typeof e.hash === 'string') {
	          return document.querySelector(e.hash);
	        } else if (typeof e === 'string') {
	          return document.querySelector(e);
	        } else {
	          return console.error('No selector supplied to open()');
	        }
	      }
	    }, {
	      key: '_open',
	      value: function _open(matches, e) {
	        this._releaseNode();
	        this.current = this._getElementContext(matches);
	        if (this.current instanceof HTMLElement === false) return console.error('VanillaModal target must exist on page.');
	        if (typeof this.$$.onBeforeOpen === 'function') this.$$.onBeforeOpen.call(this, e);
	        this._captureNode();
	        this._addClass(this.$.page, this.$$.class);
	        this._setOpenId();
	        this.isOpen = true;
	        if (typeof this.$$.onOpen === 'function') this.$$.onOpen.call(this, e);
	      }
	    }, {
	      key: '_detectTransition',
	      value: function _detectTransition() {
	        var css = window.getComputedStyle(this.$.modal, null);
	        var transitionDuration = ['transitionDuration', 'oTransitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration'];
	        var hasTransition = transitionDuration.filter(function (i) {
	          if (typeof css[i] === 'string' && parseFloat(css[i]) > 0) {
	            return true;
	          }
	        });
	        return hasTransition.length ? true : false;
	      }
	    }, {
	      key: '_close',
	      value: function _close(e) {
	        if (this.isOpen === true) {
	          this.isOpen = false;
	          if (typeof this.$$.onBeforeClose === 'function') this.$$.onBeforeClose.call(this, e);
	          this._removeClass(this.$.page, this.$$.class);
	          var transitions = this._detectTransition();
	          if (this.$$.transitions && this.$$.transitionEnd && transitions) {
	            this._closeModalWithTransition(e);
	          } else {
	            this._closeModal(e);
	          }
	        }
	      }
	    }, {
	      key: '_closeModal',
	      value: function _closeModal(e) {
	        this._removeOpenId(this.$.page);
	        this._releaseNode();
	        this.isOpen = false;
	        this.current = null;
	        if (typeof this.$$.onClose === 'function') this.$$.onClose.call(this, e);
	      }
	    }, {
	      key: '_closeModalWithTransition',
	      value: function _closeModalWithTransition(e) {
	        var _closeTransitionHandler = function () {
	          this.$.modal.removeEventListener(this.$$.transitionEnd, _closeTransitionHandler);
	          this._closeModal(e);
	        }.bind(this);
	        this.$.modal.addEventListener(this.$$.transitionEnd, _closeTransitionHandler);
	      }
	    }, {
	      key: '_captureNode',
	      value: function _captureNode() {
	        if (this.current) {
	          while (this.current.childNodes.length > 0) {
	            this.$.modalContent.appendChild(this.current.childNodes[0]);
	          }
	        }
	      }
	    }, {
	      key: '_releaseNode',
	      value: function _releaseNode() {
	        if (this.current) {
	          while (this.$.modalContent.childNodes.length > 0) {
	            this.current.appendChild(this.$.modalContent.childNodes[0]);
	          }
	        }
	      }
	    }, {
	      key: '_closeKeyHandler',
	      value: function _closeKeyHandler(e) {
	        if (Object.prototype.toString.call(this.$$.closeKeys) !== '[object Array]' || this.$$.closeKeys.length === 0) return;
	        if (this.$$.closeKeys.indexOf(e.which) > -1 && this.isOpen === true) {
	          e.preventDefault();
	          this.close(e);
	        }
	      }
	    }, {
	      key: '_outsideClickHandler',
	      value: function _outsideClickHandler(e) {
	        if (this.$$.clickOutside !== true) return;
	        var node = e.target;
	        while (node && node != document.body) {
	          if (node === this.$.modalInner) return;
	          node = node.parentNode;
	        }
	        this.close(e);
	      }
	    }, {
	      key: '_matches',
	      value: function _matches(e, selector) {
	        var el = e.target;
	        var matches = (el.document || el.ownerDocument).querySelectorAll(selector);
	        for (var i = 0; i < matches.length; i++) {
	          var child = el;
	          while (child && child !== document.body) {
	            if (child === matches[i]) return child;
	            child = child.parentNode;
	          }
	        }
	        return null;
	      }
	    }, {
	      key: '_delegateOpen',
	      value: function _delegateOpen(e) {
	        var matches = this._matches(e, this.$$.open);
	        if (matches) {
	          e.preventDefault();
	          e.delegateTarget = matches;
	          return this.open(matches, e);
	        }
	      }
	    }, {
	      key: '_delegateClose',
	      value: function _delegateClose(e) {
	        if (this._matches(e, this.$$.close)) {
	          e.preventDefault();
	          return this.close(e);
	        }
	      }
	    }, {
	      key: '_events',
	      value: function _events() {
	
	        var _closeKeyHandler = this._closeKeyHandler.bind(this);
	        var _outsideClickHandler = this._outsideClickHandler.bind(this);
	        var _delegateOpen = this._delegateOpen.bind(this);
	        var _delegateClose = this._delegateClose.bind(this);
	
	        var add = function add() {
	          this.$.modal.addEventListener('click', _outsideClickHandler, false);
	          document.addEventListener('keydown', _closeKeyHandler, false);
	          document.addEventListener('click', _delegateOpen, false);
	          document.addEventListener('click', _delegateClose, false);
	        };
	
	        this.destroy = function () {
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
	    }]);
	
	    return VanillaModal;
	  }();
	
	  exports.default = VanillaModal;
	  module.exports = exports['default'];
	});


/***/ }

});
//# sourceMappingURL=invoices.all.map