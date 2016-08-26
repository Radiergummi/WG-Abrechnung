'use strict';

/*
 global module,
 require
 */

var bcrypt   = require('bcrypt-nodejs'),
    debug    = require('debug')('flatm8:models:user'),
    mongoose = require('mongoose'),
    nconf    = require('nconf');

var userSchema = mongoose.Schema({
  firstName: String,
  lastName:  String,

  email: {
    type:     String,
    unique:   true,
    required: true
  },

  language: {
    type:    String,
    default: nconf.get('language')
  },

  creationDate: {
    type:     Date,
    required: true
  },

  role: {
    type:    String,
    default: 'normal'
  },

  /**
   * user authentication data. password is stored as a hashed and
   * salted representation using the bcrypt library.
   * used to log in to the system.
   */
  authentication: {
    username: {
      type:     String,
      unique:   true,
      required: true
    },
    password: {
      type:     String,
      required: true
    }
  },

  color: {
    type:    String,
    default: 'rgba(150,150,150,1.0)'
  }
});


/**
 * check if a password is valid
 *
 * @param password
 * @returns {*}
 */
userSchema.methods.comparePassword = function(password, callback) {
  debug('comparing %s with hash %s', password, this.authentication.password);
  return bcrypt.compare(password, this.authentication.password, function(error, matches) {
    if (error) {
      return callback(error);
    }

    callback(null, matches);
  });
};

userSchema.methods.isAdmin = function() {
  debug('checking if user %s is admin', this.authentication.username);
  return (this.role === 'admin');
};

userSchema.pre('save', function(callback) {
  var user       = this,
      saltFactor = 5;

  debug('hashing password for user %s with salt factor %s', this.authentication.username, saltFactor);

  if (!user.isModified('authentication.password')) {
    debug('user has already been set a hashed passsword. aborting.');
    return callback();
  }

  return bcrypt.genSalt(saltFactor, function(error, salt) {
    if (error) {
      debug('could not generate salt: %s', error.message);
      return callback(error);
    }

    return bcrypt.hash(user.password, salt, null, function(error, hash) {
      if (error) {
        debug('could not generate hash for %s with salt %s: %s', user.password, salt, error.message);
        return callback(error);
      }

      debug('created hash %s for user %s', hash, user.authentication.username);
      user.authentication.password = hash;

      return callback();
    });
  });
});

module.exports = mongoose.model('user', userSchema);
