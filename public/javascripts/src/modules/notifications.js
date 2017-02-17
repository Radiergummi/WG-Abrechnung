'use strict';

/*
 global window,
 document,
 app
 */

module.exports = function(app) {
  var notificationModule = function() {
  };

  notificationModule.options = {
    dismissAfter: 4000
  };

  notificationModule.prototype = {
    constructor: notificationModule
  };

  /**
   * Creates a new notification
   *
   * @param {string} type                  the notification type: one of
   *                                        - info
   *                                        - success
   *                                        - warning
   *                                        - error
   *                                        - confirmation
   * @param {string} message               the notification message to display
   * @param {Array} [actions]              an optional options object containing interaction options
   *                                       for the notification. This can be between 0 and 2 actions
   *                                       in the following format:
   *                                       { name: 'Button label', action: function(){} }
   *
   * // TODO: Implement options
   * @param {object} [options]             an optional options object, where the following options are
   *                                       available:
   * @param {bool} options.actionRequired  indicates the notification shall not disappear until the
   *                                       user has clicked on an action button. (requires actions)
   * @param {number} options.dismissTime   number of miliseconds until the notifications is removed
   *                                       automatically. Can not be used in conjunction with
   *                                       actionRequired.
   * @param {function} options.onClick     Callback to execute on clicking anywhere on the
   *                                       notification. Cannot be used with actions (eg. only for
   *                                       message notifications like "reload the page").
   * @param {string} options.position      provides a position for the notification, where position
   *                                       can be one of
   *                                        - top-left
   *                                        - top-right
   *                                        - top-center
   *                                        - bottom-left
   *                                        - bottom-right
   *                                        - bottom-center
   */
  notificationModule.prototype.create = function(type, message, actions, options) {
    var availableNotificationTypes = [
          'info',
          'success',
          'warning',
          'error',
          'confirmation'
        ],
        actionContext              = this,
        dismissAfter               = notificationModule.options.dismissAfter;

    // check whether the notification type is known
    if (availableNotificationTypes.indexOf(type) === -1) {
      return console.error(new Error('The notification type ' + type + ' is not available.'));
    }

    // set empty options Array
    actions = actions || [];

    // limit the options to two choices
    if (actions.length > 2) {
      console.error('Only two options per notification are possible');
      actions = actions.slice(0, 2);
    }


    var domNode       = document.createElement('div');
    domNode.className = 'notification ' + type;

    var messageNode       = document.createElement('span');
    messageNode.className = 'message';
    messageNode.appendChild(document.createTextNode(message));

    domNode.appendChild(messageNode);

    if (actions.length > 0) {
      for (var i = 0; i < actions.length; i++) {
        var data         = actions[ i ],
            actionId     = this.createId(8),
            actionButton = document.createElement('button');

        actionButton.className        = 'action';
        actionButton.dataset.actionId = actionId;
        actionButton.appendChild(document.createTextNode(data.name));
        domNode.appendChild(actionButton);

        actionButton.addEventListener('click', function(data) {
          data.action.call(this, domNode);

          domNode.classList.remove('visible');

          setTimeout(function() {
            domNode.remove();
            document.dispatchEvent(new Event('notifications:removed'));
          }, 200);
        }.bind(actionContext, data));
      }
    }


    /**
     * move previous notifications further up on the page
     * to make space for the new notification
     *
     * @type {NodeList}
     */
    var notificationItems = document.getElementsByClassName('notification');
    if (notificationItems.length) {
      for (var j = 0; j < notificationItems.length; j++) {
        notificationItems[ j ].style.bottom = ((j + 1) * 80 + 30) + 'px';
      }
    }


    /**
     * append notification to document
     */
    document.getElementsByTagName('body')[ 0 ].appendChild(domNode);
    domNode.classList.add('visible');

    if (type !== 'confirmation') {
      domNode.dismissTimer = setTimeout(function() {
        domNode.classList.remove('visible');

        setTimeout(function() {
          domNode.remove();
          document.dispatchEvent(new Event('notifications:removed'));
        }, 200);
      }, notificationModule.options.dismissAfter);
    }


    domNode.addEventListener('mouseenter', function() {
      if (type !== 'confirmation') {
        clearTimeout(domNode.dismissTimer);
      }
    });


    /**
     * restart automatic removal if the mouse leaves the notification
     */
    domNode.addEventListener('mouseleave', function() {
      if (type !== 'confirmation') {
        var dismissTimeout = function() {
          return setTimeout(function() {
            domNode.classList.remove('visible');

            setTimeout(function() {
              domNode.remove();
              document.dispatchEvent(new Event('notifications:removed'));
            }, 200);
          }, notificationModule.options.dismissAfter);
        };

        domNode.dismissTimer = dismissTimeout()
      }
    });
  };


  /**
   * wrapper for info notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.info = function(message, options) {
    app.translate(message).then(translated => current.create('info', translated, options));
  };


  /**
   * wrapper for success notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.success = function(message, options) {
    app.translate(message).then(translated => current.create('success', translated, options));
  };


  /**
   * wrapper for warning notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.warning = function(message, options) {
    app.translate(message).then(translated => current.create('warning', translated, options));
  };


  /**
   * wrapper for error notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.error = function(message, options) {
    app.translate(message).then(translated => current.create('error', translated, options));
  };


  /**
   * wrapper for confirmation notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.confirmation = function(message, options) {
    app.translate(message).then(translated => current.create('confirmation', translated, options));
  };


  notificationModule.prototype.createId = function(count) {
    var result   = '';
    var possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (var i = 0; i < count; i++) {
      result += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return result;
  };


  app.notifications = new notificationModule();
};
