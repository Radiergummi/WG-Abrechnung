'use strict';

var app  = require('./app'),
    main = require('./main')(app);


(function(app) {
  app.startup.push(function() {
    require('./libraries/vanilla-modal')(app);

    app.elements.userList               = document.getElementsByClassName('users')[ 0 ];
    app.elements.sendInvitationButton   = document.getElementsByClassName('send-invite') [ 0 ];
    app.elements.invitationEmailAddress = document.getElementById('invite-email-address');
    app.elements.deleteUserButton       = document.getElementsByClassName('delete-user')[ 0 ];
    app.elements.saveUserButton         = document.getElementsByClassName('save-user')[ 0 ];

    /**
     * attaches the invitation event listeners
     */
    app.listeners.addInvitationEvents = function() {
      app.on('click', app.elements.sendInvitationButton, app.events.sendInvitation);
    };

    /**
     * attaches the delete user event listeners
     */
    app.listeners.addDeleteUserEvents = function() {
      app.on('click', app.elements.deleteUserButton, app.events.deleteUser);
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

      // retrieve the email address from its field
      var emailAddress = app.elements.invitationEmailAddress.value;

      // check if the email address is a valid one using the native HTML5 validation check
      if (emailAddress && app.elements.invitationEmailAddress.checkValidity()) {

        // add the sending class and disable the button
        event.target.disabled = true;
        event.target.classList.add('sending');

        // dispatch the invitation via the appropriate socket connector
        app.connectors.sendInvitation(emailAddress, function(error, response) {
          if (error) {

            // if we have an error, show a notification
            app.translate('[[settings:user_management.invite.notification_error, ' + error.message + ']]', function(translated) {
              app.notifications.error(translated);
            });

            // log the full error to the console
            console.error(error);

            // remove the sending class and enable the button again
            event.target.classList.remove('sending');
            event.target.disabled = false;

            // keep the modal open for retry
            return;
          }

          // everything went smoothly, show a notification
          app.translate('[[settings:user_management.invite.notification_success, ' + response.invitation.sentTo + ']]', function(translated) {
            app.notifications.success(translated);
          });

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
        app.translate('[[settings:user_management.invite.notification_valid_email]]', function(translated) {
          app.notifications.warning(translated);
        });
      }
    };

    /**
     * prepares the delete user modal
     *
     * @param {Event} event
     */
    app.events.prepareDeleteUserModal = function(event) {
      app.debug('attaching prepare delete user modal data');
      var modal = document.getElementsByClassName('dialog-delete-user-wrapper')[ 0 ];

      // fill the name span element with the name received from the delete button data attributes
      modal.getElementsByClassName('name')[ 0 ].textContent = event.target.dataset.firstName;

      // pass the id of the user to delete on to the real delete button
      modal.getElementsByClassName('delete-user')[ 0 ].dataset[ 'userId' ] = event.target.dataset.userId;
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
        app.translate('[[settings:user_management.delete.notification_error_delete_self]]', function(translated) {
          app.notifications.error(translated);
          app.modals.instance.close();
        });
      }

      app.connectors.deleteUser(event.target.dataset.userId, function(error, deletedUser) {
        if (error) {

          // if we have an error, show a notification
          app.translate('[[settings:user_management.delete.notification_error, ' + error.message + ']]', function(translated) {
            app.notifications.error(translated);
          });

          // log the full error to the console
          console.error(error);

          // close the modal
          return setTimeout(app.modals.instance.close, 500);
        }

        // everything went smoothly, show a notification
        app.translate('[[settings:user_management.delete.notification_success, ' + deletedUser.firstName + ' ' + deletedUser.lastName + ']]', function(translated) {
          app.notifications.success(translated);
        });

        return setTimeout(function() {
          app.modals.instance.close();

          // delete the user row
          document.getElementById(deletedUser._id).remove();
        }, 500);
      });
    };

    app.events.prepareEditUserModal = function(event) {
      return app.connectors.getUserDetails(event.target.dataset.userId, function(user) {
        var modal  = document.getElementsByClassName('modal-edit-user-wrapper')[ 0 ],
            fields = {
              firstName: document.getElementById('modified-first-name'),
              lastName:  document.getElementById('modified-last-name'),
              role:      document.getElementById('modified-role'),
              username:  document.getElementById('modified-username'),
              password:  document.getElementById('modified-password'),
              email:     document.getElementById('modified-email'),
              language:  document.getElementById('modified-language'),
              saveUser:  modal.getElementsByClassName('save-user')
            };

        fields.firstName.value                                                    = user.firstName;
        fields.lastName.value                                                     = user.lastName;
        fields.role.querySelector('[value="' + user.role + '"]').selected         = true;
        fields.username.value                                                     = user.authentication.username;
        fields.password.value                                                     = '********';
        fields.email.value                                                        = user.email;
        fields.language.querySelector('[value="' + user.language + '"]').selected = true;
        fields.saveUser.id                                                        = user._id;
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
          return callback(response.responseText);
        } else {
          return app.error('could not get user details for user ' + userId + ': ' + response.responseText.message.raw, response.responseText.message.translation);
        }
      });
    };

    app.connectors.editUser = function(userId, userData, callback) {
      return app.http.put('/api/users/' + userId, userData, function(response) {
        if (response.ok) {
          return callback(response.responseText);
        } else {
          return app.error('could not save user ' + userId + ': ' + response.responseText.message.raw, response.responseText.message.translation);
        }
      });
    };

    // attach the event listeners
    app.listeners.addInvitationEvents();
    app.listeners.addDeleteUserEvents();
  });
})(app);
