'use strict';

module.exports = function(app) {
  app.io = require('socket.io-client')();
  
  app.events.onServerUpdate = function() {
    app.translate('[[global:server_updated.message]]|[[global:server_updated.reload]]|[[global:server_updated.later]]', function(translated) {
      var texts = translated.split('|');
      app.notifications.info(texts[ 0 ], [ {
        name: texts[ 1 ], action: function() {
          window.location.reload();
        }
      },
        {
          name: texts[ 2 ], action: function(notification) {
          notification.remove();
        }
        } ]);
    });
  };

  app.io.on('app.updated', app.events.onServerUpdate);
};
