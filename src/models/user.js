var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs');

var Invoice = require('./invoice');
ObjectId    = mongoose.Schema.Types.ObjectId;

var userSchema = mongoose.Schema({
  // _id: ObjectID(),
  firstName: String,
  lastName:  String,

  email:    { type: String, unique: true, required: true },
  language: { type: String, default: 'de_DE' },

  creationDate: { type: Date, required: true },

  role: { type: String, default: 'normal' },

  /**
   * user authentication data. password is stored as a hashed and
   * salted representation using the bcrypt library.
   * used to log in to the system.
   */
  authentication: {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  },

  color: { type: String, default: 'rgba(150,150,150,1.0)'}
});


/**
 * check if a password is valid
 *
 * @param password
 * @returns {*}
 */
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.authentication.password);
};

userSchema.methods.isAdmin = function() {
  return (this.role === 'admin');
};


module.exports = mongoose.model('user', userSchema);
