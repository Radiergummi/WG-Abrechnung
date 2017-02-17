'use strict';

/**
 * main client app
 */
var app = module.exports = {
  elements:   {}, // dom elements being used in the script
  listeners:  {}, // functions that attach listeners
  events:     {}, // event callbacks
  helpers:    {}, // global helper functions
  connectors: {}, // socket or ajax initiating functions
  templates:  {}, // dom element templates
  startup:    [], // startup callbacks that register all of the above
  config:     {}, // app config data from the server
  data:       {}  // arbitrary data to access globally
};

(function(app) {
  app.connectors.getConfig = function(callback) {
    app.io.emit('app.getConfig', function(error, data) {
      if (error) {
        return console.error(error);
      }

      app.config = data;
//    Object.freeze(app.config);
      return callback();
    });
  };

  app.init = function() {
    document.addEventListener("DOMContentLoaded", function() {
      try {

        app.elements.overlay = document.getElementById('overlay');
        app.connectors.getConfig(function() {
          window.debug = app.config.debug;
          if (window.debug) {
            window.app = app;
            app.debug  = console.debug.bind(console);
          } else {
            app.debug = function() {
            }
          }

          // call all startup scripts
          for (var i = 0; i < app.startup.length; i++) {
            try {
              app.startup[ i ].call(app);
            } catch (error) {
              return app.error(error, '[[clientError:while_startup]]');
            }
          }
        });

        window.dispatchEvent(new Event('flatm8:ready'));

        return app;
      } catch (error) {
        return app.error(error, '[[clientError:while_dependencies]]');
      }
    });
  };

  /**
   * load base dependencies
   */
  app.translator = require('./modules/translator');
  app.translate = function(text) {
    return app.translator.translate(text, document.documentElement.lang);
  };

  require('./modules/notifications')(app);
  require('./modules/errorHandler')(app);
  require('./modules/events')(app);
  require('./modules/http')(app);
  require('./modules/dom')(app);
  require('./libraries/socket.io')(app);
  app.init();
})(app);
