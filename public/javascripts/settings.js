'use strict';

var app = app || {};

(function() {
  app.startup.push(function() {
    app.elements.sendInvitationButton   = document.getElementsByClassName('send-invite') [ 0 ];
    app.elements.invitationEmailAddress = document.getElementById('invite-email-address');

    /**
     * attaches the invitation event listeners
     */
    app.listeners.addInvitationEvents = function() {
      app.on('click', app.elements.sendInvitationButton, app.events.sendInvitation);
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
            app.translator.translate('[[settings:user_management.invite.notification_error, ' + error.message + ']]', app.config.language, function(translated) {
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
          app.translator.translate('[[settings:user_management.invite.notification_success, ' + response.invitation.sentTo + ']]', app.config.language, function(translated) {
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
        app.translator.translate('[[settings:user_management.invite.notification_valid_email]]', app.config.language, function(translated) {
          app.notifications.warning(translated);
        });
      }
    };

    /**
     * deletes a user via sockets
     *
     * @param {Event} event
     */
    app.events.deleteUser = function(event) {
      var modal = document.getElementsByClassName('modal')[ 0 ];

      // fill the name span element with the name received from the delete button data attributes
      modal.getElementsByClassName('name')[ 0 ].textContent = event.target.dataset.firstName;

      // pass the id of the user to delete on to the real delete button
      modal.getElementsByClassName('delete-user')[ 0 ].dataset[ 'userId' ] = event.target.dataset.userId;
    };

    /**
     * sends an invitation request via sockets
     *
     * @param {string} emailAddress
     * @param {function(error, response)} callback
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

    // attach the event listeners
    app.listeners.addInvitationEvents();
  });
})();
