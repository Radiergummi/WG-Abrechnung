'use strict';

/*
 global module,
 require
 */

const tagModel = require('./models/tag');

const Tag = module.exports = {};

Tag.colors = [
  'red',
  'green',
  'blue',
  'yellow',
  'pink',
  'brown',
  'black'
];

/**
 * @callback tagCallback
 *
 * @param {Error} [error]  an error object, if one occurred
 * @param {*} [data]       tag data, if any
 */

/**
 * retrieves tag data from the database by ID
 *
 * @param {string} id  the ID to find a tag for
 * @param {tagCallback} callback  a callback to run on the tag object
 * @returns {object}
 */
Tag.getById = function(id, callback) {
  tagModel.findOne({ '_id': id }).exec(function(error, tag) {
    if (error) {
      return callback(error);
    }

    callback(null, tag);
  });
};

Tag.getByName = function(name, callback) {
  tagModel.findOne({ 'name': name }).exec(function(error, tag) {
    if (error) {
      return callback(error);
    }

    return callback(null, tag);
  });
};

Tag.getAll = function(callback) {
  tagModel.find({}).exec(function(error, tag) {
    if (error) {
      return callback(error);
    }

    return callback(null, tag);
  });
};

Tag.createNew = function(data, callback) {
  this.getByName(data.tagName, function(error, tag) {
    if (error) {
      return callback(error);
    }

    // if the current tag already exists, return it instead
    if (tag) {
      return callback(null, tag);
    }

    // if not, create a new tag
    let newTag = new tagModel(),
        colors = Tag.colors;

    // choose a random color if none given
    data.tagColor = data.tagColor || colors[ Math.floor(Math.random() * colors.length) ];

    newTag.name  = data.tagName;
    newTag.color = data.tagColor;

    newTag.save(function(error) {
      if (error) {
        return callback(error);
      }

      return callback(null, newTag);
    });
  });
};

Tag.remove = function(id, callback) {
  this.getById(id, function(error, tag) {
    if (error) {
      return callback(error);
    }

    let deletedTag = JSON.parse(JSON.stringify(tag));
    tag.remove();

    return callback(null, deletedTag);
  });
};
