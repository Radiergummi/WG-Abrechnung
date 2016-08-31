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
      try {
        app.translate(friendlyMessage, function(translated) {
          return console.error(translated, error);
        });
      } catch (error) {

        console.error('Could not translate error message!');
        return console.error(friendlyMessage, error);
      }
    }

    return console.error('An error occurred:', error);
  };
};
