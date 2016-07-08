'use strict';

/*
 global module,
 require
 */

var mongoose = require('mongoose');

var Invoice = require('../invoice'),
    Tag     = require('../tag');

var dashboardSockets = module.exports = {};

/**
 * socket handler to save a new tag
 *
 * @param socket
 * @param data
 * @param callback
 */
dashboardSockets.saveTag = function(socket, data, callback) {

  // retrieve the invoice by its ID
  Invoice.getById(data.invoice, function(error, invoice) {
      if (error) {
        return callback(error);
      }

      // retrieve all tags for this invoice
      var tags = invoice.tags;

      // if there are no tags yet, just create one and save it
      if (tags.length === 0) {

        // create the new tag
        return Tag.createNew({
          tagName:  data.tagName,
          tagColor: data.tagColor
        }, function(error, newTag) {
          if (error) {

            return callback(error);
          }

          // add the tag to the current invoice
          invoice.tags.push(mongoose.Types.ObjectId(newTag._id));

          // save the invoice
          invoice.save(function(error) {
            if (error) {
              return callback(error);
            }

            return callback(null, newTag);
          });
        });
      }

      // iterate over all tags for this invoice
      for (var tag in tags) {

        // if the current tag is already present in the tag list, skip it
        if (tags[ tag ].name === data.tagName) {
          continue;
        }

        // if this is a new one, create it
        return Tag.createNew({
          tagName:  data.tagName,
          tagColor: data.tagColor
        }, function(error, newTag) {
          if (error) {
            return callback(error);
          }

          // add the tag to the current invoice
          invoice.tags.push(mongoose.Types.ObjectId(newTag._id));

          invoice.save(function(error) {
            if (error) {

              return callback(error);
            }

            return callback(null, newTag);
          });
        });
      }

      return callback('This invoice is already marked with this tag');
    }
  );
};

