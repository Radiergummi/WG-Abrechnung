'use strict';

/*
 global module,
 require
 */

const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  // _id: ObjectID(),

  /**
   * the tag name
   */
  name: {
    type:     String,
    required: true
  },

  /**
   * the tag UI color
   */
  color: {
    type:     String,
    required: true
  }
});

module.exports = mongoose.model('tag', tagSchema);
