'use strict';

/*
 global module,
 require
 */

var mongo = require('mongodb');

var userModel = require('./models/user'),
    invoiceModel = require('./models/invoice');

var User = module.exports = {};

/**
 * @callback userCallback
 *
 * @param {Error} [error]  an error object, if one occurred
 * @param {*} [data]       user data, if any
 */

/**
 * retrieves user data from the database by ID
 *
 * @param {string} id  the ID to find a user for
 * @param {userCallback} callback  a callback to run on the user object
 * @returns {object}
 */
User.getById = function(id, callback) {
  userModel.findOne({ '_id': id }).populate('invoices').exec(function(error, user) {
    invoiceModel.populate(user.invoices, {
      path: 'tags'
    }, function(error, invoices) {
      if (error) {
        return callback(error);
      }

      if (!user) {
        return callback(new Error('Der angegebene Angestellte mit der ID ' + id + ' existiert nicht'));
      }

      user.invoices = invoices;

      callback(null, user);
    });
  });
};


User.getAll = function(callback) {
  userModel.find({}).exec(function(error, user) {
    if (error) return callback(error);
    if (!user) return callback(null, []);

    return callback(null, user);
  });
};


User.getWorkDays = function(callback) {

};


User.createNew = function(data, callback) {
  var newUser = new userModel();

  newUser.firstName = data.firstName;
  newUser.lastName = data.lastName;
  newUser.authentication.username = data.username;
  newUser.authentication.password = data.password;
  newUser.role = data.role;
  newUser.workHoursPerWeek = data.workHoursPerWeek;

  newUser.save(function(error) {
    if (error) {
      return callback(error);
    }

    return callback(null, newUser);
  })
};


User.remove = function(id, callback) {
  this.getById(id, function(error, user) {
    if (error) {
      return callback(error);
    }

    var deletedUser = JSON.parse(JSON.stringify(user));
    user.remove();

    return callback(null, deletedUser);
  });
};


User.getInvoices = function(id, callback) {
  this.getById(id, function(error, user) {
    if (error) {
      return callback(error);
    }

    var invoices = user.invoices;
    return callback(null, invoices);
  });
};
