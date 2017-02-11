'use strict';

/*
 global module,
 require
 */

var debug           = require('debug')('flatm8:controllers:api:users'),
    userModel       = require('../../models/user'),
    ObjectId        = require('mongoose').Types.ObjectId,
    dataValidation  = {
      isName:                        function(name) {
        return name.match(/[^<>"';:,_\\\/&%$§\!\*#=\?\+\|\(\)\[\]\{\}]+$/i);
      },
      isUserName:                    function(username) {
        return username.match(/[-_\.a-zA-Z]/);
      },
      isRole:                        function(role) {
        return (role === 'normal' || role === 'admin');
      },
      isSecurePassword:              function(requestBody) {
        return [
            requestBody.username.toLowerCase(),
            requestBody.firstName.toLowerCase(),
            requestBody.lastName.toLowerCase(),
            '12345678',
            'abcdefgh',
            'password',
            'pa55w0rd',
            'secret'
          ].indexOf(requestBody.password.toLowerCase()) === -1;
      },
      isMoreOrLessValidEmailAddress: function(emailAddress) {
        return (emailAddress.indexOf('@') !== -1);
      },
      isLanguage:                    function(language) {
        return (language.match(/[a-z]{2}_[A-Z]{2}/));
      }
    },
    validationError = function(invalidField) {
      return {
        status:  400,
        reason:  'invalid-data',
        message: {
          raw:         invalidField + ' is invalid',
          translation: '[[global:invalid_data, ' + invalidField + ']]'
        }
      }
    };

var usersApi = module.exports = {};

usersApi.getUsers = function(req, res, next) {
  return userModel
    .find({})
    .populate({ path: 'tags', model: 'tag' })
    .exec(function(error, users) {
      if (error) {
        debug('could not find users: %s', error.message);

        return res.status(500).json({
          status:  500,
          reason:  'db-error',
          message: {
            raw:         error.message,
            translation: '[[global:server_error]]'
          }
        });
      }

      debug('found %s users', users.length);

      return res.json(users);
    });
};

usersApi.getUser = function(req, res, next) {
  var userId = req.params.id;

  debug('trying to find user with ID %s', userId);

  if (!ObjectId.isValid(userId)) {
    debug('%s is no valid Mongo Object ID', userId);

    return res.status(400).json({
      status:  400,
      reason:  'invalid-id',
      message: {
        raw:         'the user ID ' + req.params.id + ' is no valid ObjectID',
        translation: '[[users:invalid_user]]'
      }
    });
  }

  return userModel
    .findOne({ _id: userId })
    .exec(function(error, user) {
      if (error) {
        debug('could not find user %s: %s', userId, error.message);

        return res.status(400).json({
          status:        500,
          reason:        'db-error',
          message:       {
            raw:         error.message,
            translation: '[[global:server_error]]'
          },
          originalError: error
        });
      }

      if (!user) {

        debug('could not find user %s: no such entity', userId);
        return res.status(404).json({
          status:  404,
          reason:  'no-entity',
          message: {
            raw:         'the user ' + req.params.id + ' does not exist',
            translation: '[[users:invalid_user]]'
          }
        });
      }

      debug('found user %s with ID %s', user.firstName, userId);
      return res.json(user);
    });
};

usersApi.createUser = function(req, res, next) {
};

usersApi.editUser = function(req, res, next) {
  var userId = req.params.id;

  return userModel.findOne({ _id: userId }).exec(function(error, user) {
    if (error) {
      debug('could not find user %s: %s', userId, error.message);

      return res.status(400).json({
        status:        500,
        reason:        'db-error',
        message:       {
          raw:         error.message,
          translation: '[[global:server_error]]'
        },
        originalError: error
      });
    }

    if (!user) {
      debug('could not find user %s', userId);

      return res.status(404).json({
        status:  404,
        reason:  'no-entity',
        message: {
          raw:         'the user ' + req.params.id + ' does not exist',
          translation: '[[users:invalid_user]]'
        }
      });
    }

    debug('found user %s with ID %s', user.firstName, userId);

    if (req.body.firstName) {
      if (dataValidation.isName(req.body.firstName)) {
        debug('first name "%s" is valid', req.body.firstName);
        user.firstName = req.body.firstName;
      } else {
        debug('first name "%s" is invalid', req.body.firstName);
        return res.status(400).json(validationError('firstName'));
      }
    }

    if (req.body.lastName) {
      if (dataValidation.isName(req.body.lastName)) {
        debug('last name "%s" is valid', req.body.lastName);
        user.lastName = req.body.lastName;
      } else {
        debug('last name "%s" is invalid', req.body.lastName);
        return res.status(400).json(validationError('lastName'));
      }
    }

    if (req.body.role) {
      if (dataValidation.isRole(req.body.role)) {
        debug('user role "%s" is valid', req.body.role);
        user.role = req.body.role;
      } else {
        debug('user role "%s" is invalid', req.body.role);
        return res.status(400).json(validationError('role'));
      }
    }

    if (req.body.username) {
      if (dataValidation.isUserName(req.body.username)) {
        debug('username "%s" is valid', req.body.username);
        user.authentication.username = req.body.username;
      } else {
        debug('username "%s" is invalid', req.body.username);
        return res.status(400).json(validationError('username'));
      }
    }

    if (req.body.password) {
      if (dataValidation.isSecurePassword(req.body)) {
        debug('user password "%s" is valid', req.body.password);
        user.authentication.password = req.body.password;
      } else {
        debug('user password "%s" is invalid', req.body.password);
        return res.status(400).json(validationError('password'));
      }
    }

    if (req.body.email) {
      if (dataValidation.isMoreOrLessValidEmailAddress(req.body.email)) {
        debug('user email "%s" is valid', req.body.email);
        user.email = req.body.email;
      } else {
        debug('user email "%s" is invalid', req.body.email);
        return res.status(400).json(validationError('email'));
      }
    }

    if (req.body.language) {
      if (dataValidation.isLanguage(req.body.language)) {
        debug('user language "%s" is valid', req.body.language);
        user.language = req.body.language;
      } else {
        debug('user language "%s" is invalid', req.body.language);
        return res.status(400).json(validationError('language'));
      }
    }

    return user.save(function(error) {
      if (error) {
        debug('could not save user %s: %s', userId, error.message);

        return res.status(500).json({
          status:  500,
          reason:  'db-error',
          message: {
            raw:         error.message,
            translation: '[[global:server_error]]'
          }
        });
      }

      debug('user %s saved', userId);

      return res.status(204).send({});
    });
  });
};
