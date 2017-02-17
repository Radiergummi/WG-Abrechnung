'use strict';

/*
 global module,
 require
 */

const debug    = require('debug')('flatm8:invoice'),
      mongo    = require('mongodb'),
      mongoose = require('mongoose'),
      moment   = require('moment');

const invoiceModel = require('./models/invoice'),
      Tag          = require('./tag');

const Invoice = module.exports = {};

/**
 * @callback invoiceCallback
 *
 * @param {Error} [error]  an error object, if one occurred
 * @param {*} [data]       invoice data, if any
 */

/**
 * retrieves invoice data from the database by ID
 *
 * @param {string}          id          the ID to find a invoice for
 * @param {invoiceCallback} callback    a callback to run on the invoice object
 * @param {boolean}         [populate]  whether to populate subdocuments or not
 * @returns {object}
 */
Invoice.getById = function(id, callback, populate) {
  if (typeof populate === 'undefined') {
    populate = true;
  }

  var query = invoiceModel.findOne({ '_id': id });

  if (populate) {
    query.populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ]);
  }

  query.exec(function(error, invoice) {
    if (error) {
      return callback(error);
    }

    if (!invoice) {
      let error    = new Error('Invoice does not exist');
      error.status = 404;

      return callback(error);
    }

    callback(null, invoice);
  });
};

/**
 * retrieves invoices from the database by day
 * @param date
 * @param callback
 */
Invoice.getByDay = function(date, callback) {
  debug('retrieving invoices from ' + date.year + '-' + date.month + '-' + date.day);

  var startDate = new Date(date.year, date.month, date.day),
      endDate   = new Date(startDate);

  endDate.setDate(startDate.getDate() + 1);

  invoiceModel
    .find({
      'creationDate': {
        $gte: startDate,
        $lt:  endDate
      }
    })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        return callback(error);
      }

      debug('got data by date');
      callback(null, invoices);
    });
};

/**
 * retrieves invoices from the database by month
 * @param date
 * @param callback
 */
Invoice.getByMonth = function(monthDate, callback) {

  var startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
      endDate   = (monthDate.getMonth() === 11
          ? new Date(monthDate.getFullYear() + 1, 0, 0)
          : new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      );

  debug('retrieving invoices between %s and %s', startDate, endDate);

  invoiceModel
    .find({
      'creationDate': {
        $gte: startDate,
        $lt:  endDate
      }
    })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        return callback(error);
      }

      debug('got ' + invoices.length + ' invoices by month');
      callback(null, invoices);
    });
};

Invoice.getAll = function(callback) {
  debug('getAll invoices');

  invoiceModel
    .find({})
    .sort({ creationDate: 'descending' })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        debug('error getting all invoices');
        return callback(error);
      }

      debug('got all ' + invoices.length + ' invoices');
      return callback(null, invoices);
    });
};

Invoice.getOwn = function(id, callback) {
  invoiceModel
    .find({ 'user': id })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        return callback(error);
      }

      return callback(null, invoices);
    });
};

Invoice.getManuallyPaginated = function(skip, limit, callback) {
  this.getAll(function(error, invoices) {
    if (error) {
      return callback(error);
    }

    return callback(null, invoices.slice(skip, limit));
  });
};

Invoice.getPaginated = function(skip, limit, callback) {
  invoiceModel
    .find({})
    .sort({ creationDate: 'descending' })
    .skip(skip)
    .limit(limit)
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        return callback(error);
      }

      return callback(null, invoices);
    });
};

Invoice.getOwnPaginated = function(id, skip, limit, callback) {
  invoiceModel
    .find({ 'user': id })
    .skip(skip)
    .limit(limit)
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        return callback(error);
      }

      return callback(null, invoices);
    });
};

Invoice.createNew = function(data, callback) {
  function processTag (tagName) {
    return new Promise((resolve, reject) => {

      debug('processing tag %s', tagName);

      // try to get the tag by name
      Tag.getByName(tagName, (error, tag) => {
        if (error) {
          debug('error retrieving tag %s: %s', tagName, error);
          return reject(error);
        }

        // if we have no tag, it doesn't exist yet
        if (!tag) {
          debug('tag %s does not exist yet', tagName);

          // ...so we create a new tag
          return Tag.createNew({
            tagName: tagName
          }, (error, newTag) => {
            if (error) {
              debug('could not create tag %s: %s', tagName, error);
              return reject(error);
            }

            debug('created tag %s with ID %s', tagName, newTag._id);

            // resolve with the new ID
            return resolve(newTag._id);
          });
        }

        debug('tag %s exists and has ID %s', tagName, tag._id);

        // the tag exists, so we resolve with the existing ID
        return resolve(tag._id);
      });
    });
  }

  return Promise.all(data.tags.map(processTag))
    .then(tagIds => Array.from(new Set(tagIds)))
    .then((tags) => new invoiceModel({
      user:         data.user,
      creationDate: data.creationDate || new Date(),
      sum:          data.sum || undefined,
      note:         data.note,
      tags:         tags
    }))
    .then(function(newInvoice) {
      newInvoice.save(function(error) {
        if (error) {
          return callback(error);
        }

        return callback(null, newInvoice);
      });
    }).catch(function(error) {
      return callback(error);
    });
};

/**
 * updates an invoice
 *
 * @param   {object}            data
 * @param   {function}          callback
 * @returns {Promise.<object>}
 */
Invoice.update = function(data, callback) {
  return new Promise((resolve, reject) => {
    invoiceModel
      .findOne({ _id: data.id })
      .exec((error, invoice) => {
        if (error) {
          debug('could not find invoice %s: %s', data.id, error.message);

          return reject(error);
        }

        debug('found invoice %s', invoice.id);
        return resolve(invoice);
      });
  }).then(invoice => {
    if (typeof data.tags === 'string' && data.tags.length > 0) {
      data.tags = data.tags.split(',');
    }

    if (data.tags.length < 1) {
      debug('invoice has no changed or added tags');
      return invoice;
    }

    debug(`invoice %s has the following tags: %s`, data.id, data.tags.join(', '));

    function processTag (tagName) {
      return new Promise((resolve, reject) => {

        debug('processing tag %s', tagName);

        // try to get the tag by name
        Tag.getByName(tagName, (error, tag) => {
          if (error) {
            debug('error retrieving tag %s: %s', tagName, error);
            return reject(error);
          }

          // if we have no tag, it doesn't exist yet
          if (!tag) {
            debug('tag %s does not exist yet', tagName);

            // ...so we create a new tag
            return Tag.createNew({
              tagName: tagName
            }, (error, newTag) => {
              if (error) {
                debug('could not create tag %s: %s', tagName, error);
                return reject(error);
              }

              debug('created tag %s with ID %s', tagName, newTag._id);

              // resolve with the new ID
              return resolve(newTag._id);
            });
          }

          debug('tag %s exists and has ID %s', tagName, tag._id);

          // the tag exists, so we resolve with the existing ID
          return resolve(tag._id);
        });
      });
    }

    return Promise.all(data.tags.map(processTag)).then(tagIds => {
      debug('got tags: ', tagIds);
      invoice.tags = Array.from(new Set(tagIds));
      return invoice;
    });
  }).then(invoice => {
    if (data.sum) {
      invoice.sum = data.sum;
    }

    if (data.date) {
      invoice.date = data.date;
    }

    if (data.note) {
      invoice.note = data.note;
    }

    return invoice.save(error => {
      if (error) {
        debug('could not save invoice %s: %s', data.id, error);
        return callback(error);
      }

      return callback(null, invoice);
    });
  })
};

Invoice.remove = function(id, callback) {
  this.getById(id, function(error, invoice) {
    if (error) {
      return callback(error);
    }

    var deletedInvoice = JSON.parse(JSON.stringify(invoice));
    invoice.remove();

    return callback(null, deletedInvoice);
  });
};

Invoice.addTag = function(id, tagId, callback) {
  this.getById(id, function(error, invoice) {
    if (error) {
      return callback(error);
    }

    invoice.tags.push(mongoose.Schema.Types.ObjectId(tagId));

    invoice.save(function(error) {
      if (error) {
        return callback(error);
      }

      return callback();
    });
  });
};

Invoice.checkOwnership = function(userId, invoiceId, callback) {
  invoiceModel.findOne({ '_id': invoiceId }).exec(function(error, invoice) {

    if (invoice.user.toString() == userId) {
      return callback(true);
    }

    return callback(false);
  });
};

/**
 * tries to parse a search query by going from least to most expensive
 * tests
 *
 * @param {object} parameters
 * @param {object} [parameters.filters]  optional set of filters
 * @param {object} [parameters.filters.byId]  optional ID filter
 * @param {object} [parameters.filters.byName]  optional name filter
 * @param {object} [parameters.filters.bySum]  optional sum filter
 * @param {object} [parameters.filters.byTag]  optional tag filter
 * @param {string} parameters.query      the original search query
 * @param {function} callback
 */
Invoice.find = function(parameters, callback) {
  debug('find method');

  if (parameters.query) {

    /**
     * if we got a wildcard character as the only input, return all invoices
     */
    if (parameters.query === '*') {
      debug('search for wildcard query');

      return this.getAll(function(error, data) {
        if (error) {
          debug('error getting all invoices');
          return callback(error);
        }

        debug('got all invoices');
        return callback(null, data);
      });
    }

    /**
     * if the query is a valid Mongo ObjectID, get the invoice by ID
     */
    if (mongoose.Types.ObjectId.isValid(parameters.query)) {
      debug('query for valid Mongo ID');

      return this.getById(parameters.query, function(error, data) {
        if (error) {
          return callback(error);
        }

        debug('received data for ID query');

        return callback(null, [ data ]);
      });
    } else {
      debug('no valid ID');
    }

    var dateRegex = parameters.query.match(/(\d{1,2})\.(\d{1,2})(\.(\d{2,4}))?/);
    if (dateRegex) {
      debug('matched date regex');
      var day   = dateRegex[ 1 ],
          month = dateRegex[ 2 ] - 1,
          year  = dateRegex[ 4 ] || new Date().getFullYear();

      if (year.toString().length === 2) {
        year = parseInt('20' + year);
      }

      return this.getByDay({
        year:  year,
        month: month,
        day:   day
      }, function(error, data) {
        if (error) {
          return callback(error);
        }

        return callback(null, data);
      });
    }

    var monthNameRegex = parameters.query.match(/(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)+\s?(\d{2,4})?/i);
    if (monthNameRegex) {
      debug('matched month name regex');

      var monthName = monthNameRegex[ 1 ],
          months    = [
            'januar',
            'februar',
            'märz',
            'april',
            'mai',
            'juni',
            'juli',
            'august',
            'september',
            'oktober',
            'november',
            'dezember'
          ],
          month     = months.indexOf(monthName),
          year      = (monthNameRegex[ 2 ] ? monthNameRegex[ 2 ] : new Date().getFullYear());

      return this.getByMonth({
        year:  year,
        month: month,
        day:   day
      }, function(error, data) {
        if (error) {
          return callback(error);
        }

        return callback(null, data);
      });
    }
  }

  if (!parameters.filters) {
    return callback('invalid search query');
  }

  /**
   * filter by ID
   */
  if (parameters.filters.byId) {
    this.getById(parameters.filters.byId.invoiceId, function(error, data) {
      if (error) {
        return callback(error);
      }

      return callback(null, data);
    });
  }

  var query = invoiceModel.find({});

  /**
   * filter by user name
   */
  if (parameters.filters.byName) {
    query.and([
      {
        $or: [
          { 'firstName': parameters.filters.byName.firstName },
          { 'lastName': parameters.filters.byName.lastName }
        ]
      }
    ]);
  }

  /**
   * filter by sum
   */
  if (parameters.filters.bySum) {
    query.and([
      {
        'sum': { $lt: parameters.filters.bySum.cap }
      }
    ]);
  }

  /**
   * filter by tag name
   */
  if (parameters.filters.byTag) {
    query.populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ]).exec(function(error, data) {
      if (error) {
        return callback(error);
      }

      // filter the invoice data and iterate over tags
      var filteredInvoices = data.filter(function(invoice) {
        for (var i = 0; i < invoice.tags.length; i++) {
          if (invoice.tags[ i ].name === parameters.filters.byTag.tagName) {
            return true;
          }
        }

        return false;
      });

      return callback(null, filteredInvoices);
    });
  }

  return query.exec(function(error, data) {
    if (error) {
      return callback(error);
    }

    return callback(null, data);
  });
};

Invoice.getSums = function(id, callback) {
  invoiceModel
    .find({})
    .populate([
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, data) {
      if (error) {
        return callback(error);
      }

      data = data.filter(function(invoice) {
        if (!id) return true;

        return (invoice.user._id.toString() !== id);
      }).map(function(invoice) {
        return invoice.sum;
      });

      return callback(null, data);
    });
};

Invoice.sortByUser = function(callback) {
  this.getAll(function(error, data) {
    if (error) {
      return callback(error);
    }

    var users = {};

    for (var i = 0; i < data.length; i++) {
      var userId = data[ i ].user._id;

      if (!users.hasOwnProperty(userId)) {
        users[ userId ] = [];
      }

      users[ userId ].push(data[ i ]);
    }

    return callback(null, users);
  });
};

Invoice.getAllByDate = function(callback) {
  this.getAll(function(error, data) {
    if (error) {
      return callback(error);
    }

    var dates = {};

    for (var i = 0; i < data.length; i++) {
      var date = data[ i ].creationDate;

      if (!dates.hasOwnProperty(date)) {
        dates[ date ] = [];
      }

      dates[ date ].push(data[ i ]);
    }

    return callback(null, dates);
  });
};

Invoice.getDateRangeByDate = function(startDate, endDate, callback) {
  endDate = (endDate.getMonth() === 11
      ? new Date(endDate.getFullYear() + 1, 0, 0)
      : new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)
  );

  debug('retrieving invoices between %s and %s', startDate, endDate);

  invoiceModel
    .find({
      'creationDate': {
        $gte: startDate,
        $lt:  endDate
      }
    })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function(error, invoices) {
      if (error) {
        return callback(error);
      }

      var dates = {};

      for (var i = 0; i < invoices.length; i++) {
        var date = (moment(invoices[ i ].creationDate).format('Do MMMM YYYY'));

        if (!dates.hasOwnProperty(date)) {
          dates[ date ] = [];
        }

        dates[ date ].push(invoices[ i ]);
      }

      debug('got ' + invoices.length + ' invoices by month');
      callback(null, dates);
    });
};

