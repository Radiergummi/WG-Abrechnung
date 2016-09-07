'use strict';

/*
 global module,
 require
 */

var userModel = require('../../models/user'),
    ObjectId  = require('mongoose').Types.ObjectId;

var usersApi = module.exports = {};

usersApi.getUsers = function(req, res, next) {
  return userModel
    .find({})
    .populate({ path: 'tags', model: 'tag' })
    .exec(function(error, users) {
      if (error) {
        return res.status(500).json({
          status:  500,
          reason:  'db-error',
          message: {
            raw:         error.message,
            translation: '[[global:server_error]]'
          }
        });
      }

      return res.json(users);
    });
};

usersApi.getUser = function(req, res, next) {
  var userId = req.params.id;

  if (!ObjectId.isValid(userId)) {
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
        return res.status(404).json({
          status:  404,
          reason:  'no-entity',
          message: {
            raw:         'the user ' + req.params.id + ' does not exist',
            translation: '[[users:invalid_user]]'
          }
        });
      }

      return res.json(user);
    });
};

usersApi.createUser = function(req, res, next) {
};
