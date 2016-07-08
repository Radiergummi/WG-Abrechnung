var mongoose = require('mongoose'),
    moment   = require('moment');

var Tag      = require('./tag'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var invoiceSchema = new mongoose.Schema({
  // _id: ObjectID(),

  /**
   * the invoice creation date
   */
  creationDate: {
    type: Date, required: true, get: function(date) {
      return moment(date).format('Do MMMM YYYY');
    }
  },

  /**
   * the invoice sum
   */
  sum: {
    type: Number, get: function(sum) {
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

module.exports = mongoose.model('invoice', invoiceSchema);
