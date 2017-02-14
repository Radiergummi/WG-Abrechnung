'use strict';

/*
 global module,
 require
 */

const mongoose = require('mongoose'),
      moment   = require('moment'),
      Schema   = mongoose.Schema,
      ObjectId = Schema.Types.ObjectId,

      Tag      = require('./tag');

const invoiceSchema = new Schema({
  // _id: ObjectID(),

  user: {
    type:     ObjectId,
    ref:      'user',
    required: true
  },

  /**
   * the invoice creation date
   */
  creationDate: {
    type:     Date,
    required: true
  },

  /**
   * the invoice sum
   */
  sum: {
    type: Number,
    get:  sum => (sum / 100).toFixed(2),
    set:  sum => sum * 100
  },

  /**
   * tags this invoice is assigned to
   */
  tags: [ {
    type: ObjectId,
    ref:  'tag'
  } ],

  /**
   * optional note for additional invoice notes
   */
  note: String
}, {
  toObject: {
    getters: true
  },
  toJSON:   {
    getters: true
  }
});

invoiceSchema.methods.getHTMLInputDate = function() {
  return new Date(this.creationDate.toString()).toISOString().substring(0, 10);
};

invoiceSchema.methods.getFormattedDate = function() {
  return moment(this.creationDate).format('Do MMMM YYYY');
};

module.exports = mongoose.model('invoice', invoiceSchema);
