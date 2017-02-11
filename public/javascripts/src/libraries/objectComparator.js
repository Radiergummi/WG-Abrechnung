'use strict';

/*
 global module,
 require
 */

/**
 * checks whether an item is an array, an object or anything else
 *
 * @param   {*}      item the item to check
 * @returns {string}      the result
 */
const getType = function(item) {
  if (Array.isArray(item)) {
    return 'array';
  }

  if (Object(item) === item) {
    return 'object';
  }

  return 'arbitrary';
};

/**
 * recursively compares two objects and returns all changed or added properties.
 * this is not able to detect deletions, because they don't exist for our use
 * case since we don't have any optional properties.
 *
 * @param   {object} app    the app
 * @param   {object} source the source object to compare
 * @param   {object} target the target object to compare
 * @returns {object}        the modified keys
 */
const compare = function(app, source, target) {

  // we run reduce on the target's keys to create a difference object,
  // therefore, we also pass an empty object as the initial value
  return Object.keys(target).reduce((difference, currentKey) => {

    // if the items are the same, we just pass the object with no changes
    if (source[ currentKey ] === target[ currentKey ]) {
      return difference;
    }

    // decide what to do based on the type of the current item
    switch (getType(source[ currentKey ])) {

      // if we have an array, either we get the difference for those keys
      // as well or the target isn't an array, so we just assign the new
      // content.
      case 'array':
        if (Array.isArray(target[ currentKey ])) {

          // filter the target to exclude all previously existing keys
          difference[ currentKey ] = target[ currentKey ].filter(
            item => source[ currentKey ].indexOf(item) === -1
          );
        } else {

          // just assign the new content
          difference[ currentKey ] = target[ currentKey ];
        }
        break;

      // objects need to be compared recursively
      case 'object':
        if (Object(target[ currentKey ]) === target[ currentKey ]) {
          difference[ currentKey ] = compare(
            app,
            source[ currentKey ],
            target[ currentKey ]
          );
        } else {

          // just assign the new content
          difference[ currentKey ] = target[ currentKey ];
        }
        break;

      default:
        difference[ currentKey ] = target[ currentKey ];
        break;
    }

    // return the difference object
    return difference;
  }, {});
};

module.exports = compare;
