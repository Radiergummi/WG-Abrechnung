'use strict';

/*
 global module,
 require
 */
var eventModel = require('./models/event');

var Event = module.exports = {};

/**
 * pushes an event to the database
 *
 * @param {string} name     the event name
 * @param {string} emitter  the event emitter (eg. user or IP)
 * @param {string} type     the event type
 * @param {object} [data]   additional event data, if needed
 */
Event.push = function(name, emitter, type, data) {
  var eventItem = new eventModel();

  eventItem.name = name;
  eventItem.emitter = emitter;
  eventItem.type = type;
  eventItem.data = data;

  eventItem.date = new Date();

  eventItem.save(function(error) {
    if (error) {
      throw error;
    }
  });
};


/**
 * retrieves all events from the database
 *
 * @param {function} callback  a callback to run once the events
 *                             have been retrieved
 */
Event.getAll = function(callback) {
  eventModel.find({}).exec(function(error, events) {
    if (error) {
      return callback(error);
    }

    if (! events) {
      return callback(null, []);
    }

    return callback(null, events.reverse());
  });
};


/**
 * get a paginated set of events
 *
 * @param {number} amount             the amount of events to retrieve
 * @param {function|number} offset    the offset to retrieve items after,
 *                                    useful if a previous page has
 *                                    already been fetched. That way,
 *                                    you can skip the first X events.
 *                                    If omitted, is interpreted as the
 *                                    callback.
 * @param {function} [callback]       a callback to run once the events
 *                                    have been retrieved.
 *
 */
Event.getPaginated = function(amount, offset, callback) {
  if (typeof offset === 'function' && typeof callback === 'undefined') {
    callback = offset;
    offset = 0;
  }

  eventModel.find({}).skip(offset).limit(amount).exec(function(error, events) {
    if (error) {
      return callback(error);
    }

    if (! events) {
      return callback(null, []);
    }

    return callback(null, events.reverse());
  });
};
