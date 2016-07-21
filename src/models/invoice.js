'use strict';

/*
 global module,
 require
 */

var mongoose = require('mongoose'),
    moment   = require('moment');

var Tag      = require('./tag'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var invoiceSchema = new mongoose.Schema({
  // _id: ObjectID(),

  user: { type: ObjectId, ref: 'user', required: true },

  /**
   * the invoice creation date
   */
  creationDate: { type: Date, required: true },

  /**
   * the invoice sum
   */
  sum: {
    type: Number, get: function (sum) {
      return sum / 100;
    }
  },

  /**
   * tags this invoice is assigned to
   */
  tags: [
    { type: ObjectId, ref: 'tag' }
  ]
}, {
  toObject: { getters: true },
  toJSON:   { getters: true }
});

invoiceSchema.methods.getHTMLInputDate = function () {
  return new Date(this.creationDate.toString()).toISOString().substring(0, 10);
};

invoiceSchema.methods.getFormattedDate = function () {
  return moment(this.creationDate).format('Do MMMM YYYY');
};

module.exports = mongoose.model('invoice', invoiceSchema);
