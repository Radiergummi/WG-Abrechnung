'use strict';

/*
 global module,
 require
 */

var debug           = require('debug')('flatm8:sockets:settings'),
    nconf           = require('nconf'),
    moment          = require('moment'),
    Invitation      = require('../invitation'),
    User            = require('../user'),
    mailer          = require('../mailer'),
    settingsSockets = module.exports = {};

/**
 * creates an invitation in the db and sends it as an email
 *
 * @param socket
 * @param emailAddress
 * @param callback
 */
settingsSockets.sendInvitation = function(socket, emailAddress, callback) {

  /**
   * retrieve the user that tries to send the invitation and verify
   * that he is an administrator
   */
  return new Promise(function(resolve, reject) {
    return User.getById(socket._id, function(error, user) {
      if (error) {
        debug('Could not determine socket user: %s', error.message);
        return reject(error);
      }

      if (!user.isAdmin) {
        debug('User %s does not seem to be an admin. Actual role: %s', user._id, user.role);
        return reject(new Error('Administrative socket settings.sendInvitation has been called by a non-administrator.'));
      }

      debug('found user with ID %s', user._id);
      return resolve(user);
    });
  })

  /**
   * create the invitation
   */
    .then(function(user) {
      return new Promise(function(resolve, reject) {
        return Invitation.create(emailAddress, function(error, invitation) {
          if (error) {
            debug('could not create a new invitation document: %s', error.message);
            return reject(error);
          }

          debug('invitation created with token %s', invitation.token);
          return resolve({
            user:       user,
            invitation: invitation
          });
        });
      });
    })

    /**
     * send the invitation email
     */
    .then(function(userAndInvitation) {
      return new Promise(function(resolve, reject) {
        var invitedBy      = JSON.parse(JSON.stringify(userAndInvitation.user)),
            invitation     = userAndInvitation.invitation,
            url            = nconf.get('url'),
            activationLink = url + '/register/',
            appName        = nconf.get('name');

        debug('Sending invitation email now.');
        return mailer.sendToEmail(
          'emails/invitation',
          {
            activationLink: activationLink,
            token:          invitation.token,
            expires:        moment(invitation.expires).format('Do MMMM YYYY'),
            invitedBy:      invitedBy,
            subject:        '[[email:invitation.subject, ' + appName + ']]',
            appName:        appName,
            url:            url
          },
          emailAddress,
          function(error, response) {
            if (error) {
              debug('invitation email could not be sent: %s. Response: %s', error.message, response);
              return reject(error);
            }

            debug('invitation was sent successfully.');
            return resolve({
              response:   response,
              invitation: invitation
            });
          });
      });
    })

    /**
     * return the socket callback
     */
    .then(function(data) {
      return callback(null, data);
    })

    /**
     * throw any occurred errors
     */
    .catch(function(error) {
      return callback(error);
    });
};
