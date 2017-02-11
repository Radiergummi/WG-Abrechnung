'use strict';

var app  = require('./app'),
    main = require('./main')(app);


(function(app) {
  app.startup.push(function() {
    require('./libraries/vanilla-modal')(app);

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
          app.notifications.error('[[settings:user_management.delete.notification_error, ' + error.message + ']]');

          // log the full error to the console
          console.error(error);

          // close the modal
          return setTimeout(app.modals.instance.close, 500);
        }

        // everything went smoothly, show a notification
        app.translate(
          '[[settings:user_management.delete.notification_success, ' + deletedUser.firstName + ' ' + deletedUser.lastName + ']]',
          function(translated) {
            app.notifications.success(translated);
          });

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
