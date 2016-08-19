'use strict';

/*
 global module,
 require
 */

var crypto          = require('crypto'),
    debug           = require('debug')('flatm8:invitation'),
    invitationModel = require('./models/invitation'),
    Invitation      = module.exports = {};

/**
 * @callback invitationCallback
 *
 * @param {Error} error   an error object, if one occurred
 * @param {*}     [data]  invitation data, if any
 */

/**
 * retrieves all invitations
 *
 * @param {invitationCallback} callback
 */
Invitation.getAll = function(callback) {
  return invitationModel.find({}, function(error, invitations) {
    if (error) {
      debug('could not retrieve invitations: %s', error.message);
      return callback(error);
    }

    debug('found %s invitations', invitations.length);
    return callback(null, invitations);
  });
};

/**
 * retrieves all invitations for a certain recipient email address
 *
 * @param {string}             emailAddress
 * @param {invitationCallback} callback
 */
Invitation.getByRecipient = function(emailAddress, callback) {
  return invitationModel.find({ 'sentTo': emailAddress }, function(error, invitations) {
    if (error) {
      debug('could not find invitations sent to %s', emailAddress);
      return callback(error);
    }

    debug('found %s invitations for %s', invitations.length, emailAddress);
    return callback(invitations);
  });
};

/**
 * retrieves all invitations that expire before the specified date
 *
 * @param {Date}               expirationDate
 * @param {invitationCallback} callback
 */
Invitation.getByExpiration = function(expirationDate, callback) {
  return invitationModel.find({ 'expiration': { '$lte': expirationDate } }, function(error, invitations) {
    if (error) {
      debug('could not find invitations expiring before %s', expirationDate.toLocaleDateString());
      return callback(error);
    }

    debug('found %s invitations expiring before %s', invitations.length, expirationDate.toLocaleDateString());
    return callback(invitations);
  });
};

/**
 * creates a new invitation
 *
 * @param   {string}             emailAddress
 * @param   {invitationCallback} callback
 * @returns {Promise}
 */
Invitation.create = function(emailAddress, callback) {
  return new Promise(function(resolve, reject) {
    return crypto.randomBytes(20, function(error, buffer) {
      if (error) {
        debug('could not create random bytes for invitation token: %s', error.message);
        return reject(error);
      }

      var token = buffer.toString('hex');

      debug('created random invitation token %s', token);
      return resolve(token);
    });
  })
    .then(function(token) {
      var expires = new Date();

      // add three days to expiration date
      expires.setDate(expires.getDate() + 3);

      debug('set expiration for new invitation to %s (three days from %s)',
        expires.toLocaleDateString(),
        new Date().toLocaleDateString()
      );

      // create a new invitation
      var newInvitation   = new invitationModel();
      newInvitation.token = token;
      newInvitation.expires = expires;
      newInvitation.sentTo = emailAddress;

      return new Promise(function(resolve, reject) {

        // save the new invitation
        return newInvitation.save(function(error) {
          if (error) {
            debug('could not save new invitation: %s', error.message);
            return reject(error);
          }

          debug('new invitation saved with ID %s', newInvitation._id);
          return resolve(newInvitation);
        });
      });
    })
    .then(function(newInvitation) {
      return callback(null, newInvitation);
    })
    .catch(function(error) {
      return callback(error);
    });
};

/**
 * verifies an invitation. if it is valid, deletes the invitation
 *
 * @param {string} token                 the invitation token to check for
 * @param {invitationCallback} callback
 */
Invitation.verify = function(token, callback) {
  invitationModel.findOne({ 'token': token }).exec(function(error, invitation) {
    if (error) {
      debug('could not find an invitation with the token %s: %s', token, error.message);
      return callback(error);
    }

    if (!invitation) {
      debug('could not find an invitation with the token %s: invalid token', token);
      return callback({ message: '[[clientError:invalid_token_help_text]]', type: '[[clientError:invalid_token]]' });
    }

    debug('found the invitation %s with the token %s', invitation, token);

    // check if the invitation has expired yet
    if (invitation.expires < new Date()) {

      debug('the invitation has expired at %s (since %s days)',
        invitation.expires,
        Math.ceil(Math.abs(new Date().getTime() - invitation.expires.getTime()) / (1000 * 3600 * 24))
      );

      // if it has, remove it
      invitation.remove(function(error) {
        if (error) {
          debug('could not remove expired invitation %s: %s', invitation._id, error.message);
          return callback(error);
        }

        debug('invitation has expired and was removed.');
        return callback({ message: '[[clientError:expired_token_help_text]]', type: '[[clientError:expired_token]]' });
      });
    }

    debug('found a valid invitation with ID %s. It will expire at %s (in %s days)',
      invitation._id,
      invitation.expires,
      Math.ceil(Math.abs(new Date().getTime() - invitation.expires.getTime()) / (1000 * 3600 * 24))
    );

    // success - we don't need this no more!
    /*invitation.remove(function(error) {
      if (error) {
        debug('could not remove answered invitation %s: %s', invitation._id, error.message);
        return callback(error);
      }

      debug('invitation was valid and was removed. returning true');*/
      return callback(null, true);
/*    });*/
  });
};
