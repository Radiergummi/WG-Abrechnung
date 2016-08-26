'use strict';

/*
 global module,
 require
 */

var mongo = require('mongodb');

var file = require('./meta/file'),
    userModel    = require('./models/user'),
    invoiceModel = require('./models/invoice');

var User = module.exports = {};


/**
 * @callback userCallback
 *
 * @param {Error} error  an error object, if one occurred
 * @param {*} [data]     user data, if any
 */

User.getAll = function(callback) {
  userModel.find({}).exec(function(error, user) {
    if (error) return callback(error);
    if (!user) return callback(null, []);

    return callback(null, user);
  });
};

/**
 * retrieves user data from the database by ID
 *
 * @param {string} id  the ID to find a user for
 * @param {userCallback} callback  a callback to run on the user object
 * @returns {object}
 */
User.getById = function(id, callback) {
  return userModel.findOne({ '_id': id }).exec(function(error, user) {
    if (error) {
      return callback(error);
    }

    return callback(null, user);
  });
};

User.getByEmail = function(emailAddress, callback) {
  return userModel.findOne({ 'email': emailAddress }, function(error, user) {
    if (error) {
      return callback(error);
    }

    return callback(null, user);
  });
};

User.getByUsername = function(username, callback) {
  return userModel.findOne({ 'authentication.username': username }, function(error, user) {
    if (error) {
      return callback(error);
    }

    return callback(null, user);
  });
};

User.getByLanguage = function(language, callback) {
};

User.getByName = function(name, callback) {
};

User.createNew = function(data, callback) {
  var newUser = new userModel();

  newUser.creationDate            = new Date();
  newUser.firstName               = data.firstName;
  newUser.lastName                = data.lastName;
  newUser.email                   = data.email;
  newUser.language                = data.language;
  newUser.color                   = data.color;
  newUser.authentication.username = data.username;
  newUser.authentication.password = data.password;
  newUser.role                    = data.role;

  newUser.save(function(error) {
    if (error) {
      return callback(error);
    }
    
    file.copy('public/images/users/default.jpg', 'public/images/users/' + newUser._id + '.jpg', function(error) {
      if (error) {
        return callback(error);
      }

      return callback(null, newUser);
    });
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

/**
 * Arbitrary methods to work with user data
 */

User.getInvoices = function(id, callback) {
  this.getById(id, function(error, user) {
    if (error) {
      return callback(error);
    }

    var invoices = user.invoices;
    return callback(null, invoices);
  });
};

User.getPaginatedInvoices = function(id, skip, limit, callback) {
  this.getInvoices(id, function(error, invoices) {
    if (error) {
      return callback(error);
    }

    return callback(null, invoices.slice(skip, limit));
  });
};

User.countAll = function(callback) {
  userModel.count({}, function(error, amount) {
    if (error) {
      return callback(error);
    }

    return callback(null, amount);
  });
};

User.getIds = function(callback) {
  userModel.find({}, '_id', function(error, ids) {
    if (error) {
      return callback(error);
    }

    return callback(null, ids);
  });
};

