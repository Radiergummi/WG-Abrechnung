'use strict';

module.exports = function(app) {
  /**
   * default error handler that logs errors to the console. can be replaced
   * with more sophisticated handlers, as long as they take an error object
   * as their first parameter.
   *
   * @param {Error}  error              the thrown error object
   * @param {string} [friendlyMessage]  an optional friendly error message
   * @returns {*}
   */
  app.error = function(error, friendlyMessage) {
    if (friendlyMessage) {
        app.notifications.error(friendlyMessage);
    }

    return console.error('An error occurred:', error);
  };
};
