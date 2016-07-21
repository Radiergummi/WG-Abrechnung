'use strict';

/*
 global module,
 require
 */

var debug    = require('debug')('flatm8:invoice'),
    mongo    = require('mongodb'),
    mongoose = require('mongoose'),
    moment   = require('moment');

var invoiceModel = require('./models/invoice');

var Invoice = module.exports = {};

/**
 * @callback invoiceCallback
 *
 * @param {Error} [error]  an error object, if one occurred
 * @param {*} [data]       invoice data, if any
 */

/**
 * retrieves invoice data from the database by ID
 *
 * @param {string} id  the ID to find a invoice for
 * @param {invoiceCallback} callback  a callback to run on the invoice object
 * @returns {object}
 */
Invoice.getById = function (id, callback) {
  invoiceModel
    .findOne({ '_id': id })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function (error, invoice) {
      if (error) {
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
Invoice.getByDay = function (date, callback) {
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
    .exec(function (error, invoices) {
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
Invoice.getByMonth = function (date, callback) {
  debug('retrieving invoices from ' + date.year + '-' + date.month);

  var startDate = new Date(date.year, date.month, 1),
      endDate   = new Date(date.year, (date.month + 1), 0);

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
    .exec(function (error, invoices) {
      if (error) {
        return callback(error);
      }

      debug('got ' + invoices.length + ' invoices by month');
      callback(null, invoices);
    });
};

Invoice.getAll = function (callback) {
  debug('getAll invoices');

  invoiceModel
    .find({})
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function (error, invoices) {
      if (error) {
        debug('error getting all invoices');
        return callback(error);
      }

      debug('got all ' + invoices.length + ' invoices');
      return callback(null, invoices);
    });
};

Invoice.getOwn = function (id, callback) {
  invoiceModel
    .find({ 'user': id })
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function (error, invoices) {
      if (error) {
        return callback(error);
      }

      return callback(null, invoices);
    });
};

Invoice.getManuallyPaginated = function (skip, limit, callback) {
  this.getAll(function (error, invoices) {
    if (error) {
      return callback(error);
    }

    return callback(null, invoices.slice(skip, limit));
  });
};

Invoice.getPaginated = function (skip, limit, callback) {
  invoiceModel
    .find({})
    .skip(skip)
    .limit(limit)
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function (error, invoices) {
      if (error) {
        return callback(error);
      }

      return callback(null, invoices);
    });
};

Invoice.getOwnPaginated = function (id, skip, limit, callback) {
  invoiceModel
    .find({ 'user': id })
    .skip(skip)
    .limit(limit)
    .populate([
      { path: 'tags', model: 'tag' },
      { path: 'user', model: 'user' }
    ])
    .exec(function (error, invoices) {
      if (error) {
        return callback(error);
      }

      return callback(null, invoices);
    });
};

Invoice.createNew = function (data, callback) {
  var newInvoice = new invoiceModel();

  newInvoice.creationDate = Date.now();

  if (data.hasOwnProperty('sum')) {
    newInvoice.sum = data.sum;
  }

  if (data.hasOwnProperty('tags')) {
    newInvoice.tags = data.tags;
  }

  newInvoice.save(function (error) {
    if (error) {
      return callback(error);
    }

    return callback(null, newInvoice);
  })
};

Invoice.remove = function (id, callback) {
  this.getById(id, function (error, invoice) {
    if (error) {
      return callback(error);
    }

    var deletedInvoice = JSON.parse(JSON.stringify(invoice));
    invoice.remove();

    return callback(null, deletedInvoice);
  });
};

Invoice.addTag = function (id, tagId, callback) {
  this.getById(id, function (error, invoice) {
    if (error) {
      return callback(error);
    }

    invoice.tags.push(mongoose.Schema.Types.ObjectId(tagId));

    invoice.save(function (error) {
      if (error) {
        return callback(error);
      }

      return callback();
    });
  });
};

Invoice.checkOwnership = function (userId, invoiceId, callback) {
  invoiceModel.findOne({ '_id': invoiceId }).exec(function (error, invoice) {

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
Invoice.find = function (parameters, callback) {
  debug('find method');

  if (parameters.query) {

    /**
     * if we got a wildcard character as the only input, return all invoices
     */
    if (parameters.query === '*') {
      debug('search for wildcard query');

      return this.getAll(function (error, data) {
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

      return this.getById(parameters.query, function (error, data) {
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
      }, function (error, data) {
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
      }, function (error, data) {
        if (error) {
          return callback(error);
        }

        return callback(null, data);
      });
    }
  }

  if (! parameters.filters) {
    return callback('invalid search query');
  }

  /**
   * filter by ID
   */
  if (parameters.filters.byId) {
    this.getById(parameters.filters.byId.invoiceId, function (error, data) {
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
    ]).exec(function (error, data) {
      if (error) {
        return callback(error);
      }

      // filter the invoice data and iterate over tags
      var filteredInvoices = data.filter(function (invoice) {
        for (var i = 0; i < invoice.tags.length; i ++) {
          if (invoice.tags[ i ].name === parameters.filters.byTag.tagName) {
            return true;
          }
        }

        return false;
      });

      return callback(null, filteredInvoices);
    });
  }


  return query.exec(function (error, data) {
    if (error) {
      return callback(error);
    }

    return callback(null, data);
  });
};

Invoice.getSums = function (id, callback) {
  invoiceModel
    .find({})
    .populate([
      { path: 'user', model: 'user' }
    ])
    .exec(function (error, data) {
      if (error) {
        return callback(error);
      }

      data = data.filter(function (invoice) {
        if (! id) return true;

        return (invoice.user._id.toString() !== id);
      }).map(function (invoice) {
        return invoice.sum;
      });

      return callback(null, data);
    });
};

Invoice.getByUser = function(callback) {
  this.getAll(function(error, data) {
    if (error) {
      return callback(error);
    }

    var users = {};

    for (var i = 0; i < data.length; i++) {
      var userId = data[ i ].user._id;

      if (!users.hasOwnProperty(userId)) {
        users[userId] = [];
      }

      users[userId].push(data[ i ]);
    }

    return callback(null, users);
  });
};
