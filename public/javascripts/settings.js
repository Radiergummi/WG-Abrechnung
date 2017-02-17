webpackJsonp([6],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app  = __webpack_require__(1),
	    main = __webpack_require__(69)(app);
	
	(function(app) {
	  app.startup.push(function() {
	    __webpack_require__(80)(app);
	
	    app.elements.userList               = document.getElementsByClassName('users')[ 0 ];
	    app.elements.sendInvitationButton   = app.dom('.send-invite');
	    app.elements.invitationEmailAddress = app.dom('#invite-email-address');
	    app.elements.deleteUserButton       = app.dom('.delete-user');
	    app.elements.saveUserButton         = app.dom('.save-user');
	
	    /**
	     * attaches the invitation event listeners
	     */
	    app.listeners.addInvitationEvents = function() {
	      app.elements.sendInvitationButton.on('click', app.events.sendInvitation);
	    };
	
	    /**
	     * attaches the delete user event listeners
	     */
	    app.listeners.addDeleteUserEvents = function() {
	      app.elements.deleteUserButton.on('click', app.events.deleteUser);
	    };
	
	    app.listeners.addEditUserEvents = function() {
	//      app.on('click')
	    };
	
	    /**
	     * sends an invitation via sockets
	     *
	     * @param {Event} event
	     */
	    app.events.sendInvitation = function(event) {
	      var emailAddressField = app.elements.invitationEmailAddress[ 0 ];
	
	      // retrieve the email address from its field
	      var emailAddress = emailAddressField.value;
	
	      // check if the email address is a valid one using the native HTML5 validation check
	      if (emailAddress && emailAddressField.checkValidity()) {
	
	        // add the sending class and disable the button
	        event.target.disabled = true;
	        event.target.classList.add('sending');
	
	        // dispatch the invitation via the appropriate socket connector
	        app.connectors.sendInvitation(emailAddress, function(error, response) {
	          if (error) {
	
	            // if we have an error, show a notification
	            app.notifications.error('[[settings:user_management.invite.notification_error, ' + error.message + ']]');
	
	            // log the full error to the console
	            console.error(error);
	
	            // remove the sending class and enable the button again
	            event.target.classList.remove('sending');
	            event.target.disabled = false;
	
	            // keep the modal open for retry
	            return;
	          }
	
	          // everything went smoothly, show a notification
	          app.notifications.success('[[settings:user_management.invite.notification_success, ' + response.invitation.sentTo + ']]');
	
	          // leave the user some time to see what's going on
	          return setTimeout(function() {
	
	            // remove the sending class and enable the button again
	            event.target.classList.remove('sending');
	            event.target.disabled = false;
	
	            // close the modal
	            app.modals.instance.close();
	          }, 500);
	        });
	      } else {
	
	        // the validation failed, show a notification
	        app.notifications.warning('[[settings:user_management.invite.notification_valid_email]]');
	      }
	    };
	
	    /**
	     * prepares the delete user modal
	     *
	     * @param {Event} event
	     */
	    app.events.prepareDeleteUserModal = function(event) {
	      app.debug('attaching prepare delete user modal data');
	      var modal = app.dom('.dialog-delete-user-wrapper')[ 0 ];
	
	      // fill the name span element with the name received from the delete button data attributes
	      app.dom('.name', modal).text(event.target.dataset.firstName);
	
	      // pass the id of the user to delete on to the real delete button
	      app.dom('.delete-user').data('userId', event.target.dataset.userId);
	    };
	
	    /**
	     * deletes a user via sockets
	     *
	     * @param {Event} event
	     */
	    app.events.deleteUser = function(event) {
	
	      // prevent users from deleting themselves
	      if (event.target.dataset.userId === app.config.user._id) {
	
	        // if we have an error, show a notification
	        app.notifications.error('[[settings:user_management.delete.notification_error_delete_self]]');
	        app.modals.instance.close();
	      }
	
	      app.connectors.deleteUser(event.target.dataset.userId, function(error, deletedUser) {
	        if (error) {
	
	          // if we have an error, show a notification
	          app.notifications.error(`[[settings:user_management.delete.notification_error, ${error.message}]]`);
	
	          // log the full error to the console
	          console.error(error);
	
	          // close the modal
	          return setTimeout(app.modals.instance.close, 500);
	        }
	
	        // everything went smoothly, show a notification
	        app.notifications.success(`[[settings:user_management.delete.notification_success, ${deletedUser.firstName} ${deletedUser.lastName}]]`);
	
	        return setTimeout(function() {
	          app.modals.instance.close();
	
	          // delete the user row
	          app.dom('#' + deletedUser._id).remove();
	        }, 500);
	      });
	    };
	
	    app.events.prepareEditUserModal = function(event) {
	      return app.connectors.getUserDetails(event.target.dataset.userId, function(user) {
	        var modal  = app.dom('.modal-edit-user-wrapper'),
	            fields = {
	              firstName: app.dom('#modified-first-name', modal),
	              lastName:  app.dom('#modified-last-name', modal),
	              role:      app.dom('#modified-role', modal),
	              username:  app.dom('#modified-username', modal),
	              email:     app.dom('#modified-email', modal),
	              language:  app.dom('#modified-language', modal),
	              saveUser:  app.dom('.save-user', modal)
	            };
	
	        fields.firstName.value(user.firstName);
	        fields.lastName.value(user.lastName);
	        fields.role.children('[value="' + user.role + '"]').selected(true);
	        fields.username.value(user.authentication.username);
	        fields.email.value(user.email);
	        fields.language.children('[value="' + user.language + '"]').selected(true);
	        fields.saveUser.id(user._id).on('click', app.events.editUser);
	      });
	    };
	
	    app.events.editUser = function(event) {
	      var modal = app.dom('.modal-edit-user-wrapper');
	
	      return app.connectors.editUser(event.target.id, {
	        firstName: app.dom('#modified-first-name', modal).value(),
	        lastName:  app.dom('#modified-last-name', modal).value(),
	        role:      app.dom('#modified-role', modal).value(),
	        username:  app.dom('#modified-username', modal).value(),
	        password:  app.dom('#modified-password', modal).value(),
	        email:     app.dom('#modified-email', modal).value(),
	        language:  app.dom('#modified-language', modal).value(),
	        saveUser:  app.dom('.save-user', modal).value()
	      });
	    };
	
	    /**
	     * sends an invitation request via sockets
	     *
	     * @param {string} emailAddress
	     * @param {function(Error, object)} callback
	     */
	    app.connectors.sendInvitation = function(emailAddress, callback) {
	
	      // emit the socket call
	      app.io.emit('settings.sendInvitation', emailAddress, function(error, response) {
	        if (error) {
	          return callback(error, response);
	        }
	
	        return callback(null, response);
	      });
	    };
	
	    /**
	     * deletes a user via sockets
	     *
	     * @param {string} userId
	     * @param {function(Error, object)} callback
	     * @returns {*}
	     */
	    app.connectors.deleteUser = function(userId, callback) {
	      if (!userId) {
	        return callback(new Error('invalid user ID ' + userId), null);
	      }
	
	      app.io.emit('settings.deleteUser', userId, function(error, deletedUser) {
	        if (error) {
	          return callback(error, null);
	        }
	
	        return callback(null, deletedUser);
	      });
	    };
	
	    app.connectors.createUser = function(userData, callback) {
	      app.post('/api/users', userData, function(response) {
	        if (response.ok) {
	          return callback(response.responseText);
	        } else {
	          return app.error('could not save user ' + userId + ': ' + response.responseText.message.raw, response.responseText.message.translation);
	        }
	      });
	    };
	
	    app.connectors.getUserDetails = function(userId, callback) {
	      return app.http.get('/api/users/' + userId, function(response) {
	        if (response.ok) {
	          return callback(JSON.parse(response.responseText));
	        } else {
	          return app.error('could not get user details for user ' + userId + ': ' + response.responseText.message.raw, response.responseText.message.translation);
	        }
	      });
	    };
	
	    app.connectors.editUser = function(userId, userData) {
	      if (userData.password.length <= 0) {
	        delete userData.password;
	      }
	
	      return app.http.put('/api/users/' + userId, userData, function(response) {
	        if (response.ok) {
	          // TODO: Update user fields throughout the app
	          app.dom('[data-user-id="' + userId + '"]').trigger('flatm8:user_updated', {
	            userId:    userId,
	            firstName: userData.firstName,
	            lastName:  userData.lastName
	          });
	          app.notifications.success('[[settings:user_management.edit.notification_success, ' + userData.firstName + ']]');
	
	          return setTimeout(app.modals.instance.close, 500);
	        } else {
	          var result = JSON.parse(response.responseText);
	          return app.error('could not save user ' + userId + ': ' + result.message.raw, result.message.translation);
	        }
	      });
	    };
	
	    // attach the event listeners
	    app.listeners.addInvitationEvents();
	    app.listeners.addDeleteUserEvents();
	  });
	})(app);


/***/ },

/***/ 80:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = function(app) {
	  var vanillaModal = __webpack_require__(81);
	
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

/***/ 81:
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
//# sourceMappingURL=settings.map