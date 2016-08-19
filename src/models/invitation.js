'use strict';

/*
 global module,
 require
 */

var mongoose = require('mongoose');

var invitationSchema = mongoose.Schema({

  /**
   * the unique invitation token required for registration
   */
  token: { type: String, required: true },

  /**
   * the expiration date for the invitation
   */
  expires: { type: Date, required: true },

  /**
   * the recipient email address
   */
  sentTo: { type: String, required: true }
});


module.exports = mongoose.model('invitation', invitationSchema);
