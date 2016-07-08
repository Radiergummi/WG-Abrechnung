var mongoose = require('mongoose');

var Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var eventSchema = mongoose.Schema({
  // _id: ObjectID(),

  // the event name
  name: String,

  // the event emitter (user or IP)
  emitter: String,

  /**
   *  event type. can be one of the following:
   *   - info:    purely informational
   *   - warn:    possibly malicious action
   *   - auth:    authentication/permission related
   *   - error:   system errors
   *   - system:  system initiated events
   */
  type: String,

  // event date
  date: Date,

  // additional data
  data: Object
});


module.exports = mongoose.model('Event', eventSchema);
