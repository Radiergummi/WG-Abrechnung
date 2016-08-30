'use strict';

var app  = require('./app'),
    main = require('./main')(app);

require('./libraries/chart.js')(app);

(function(app) {
  app.startup.push(function () {
    app.elements.ownInvoiceStatistics = document.getElementsByClassName('flat-spending') [ 0 ];

    app.listeners.addLoadStatistics = function () {
      app.events.createCharts();
    };

    app.events.createCharts = function () {
      app.connectors.getInvoiceSum(function (error, data) {
        if (error) {
          // TODO: Render error image
          console.error(error);
        }
        console.log(data);
        app.charts.line(app.elements.ownInvoiceStatistics, 'flat-spending', data);
      });
    };

    app.connectors.getInvoiceSumByUser = function (id, callback) {
      return app.io.emit('statistics.getInvoiceSumByUser', id, callback);
    };

    app.connectors.getOwnInvoiceSum = function (callback) {
      return app.io.emit('statistics.getInvoiceSumByUser', callback);
    };

    app.connectors.getInvoiceSum = function (callback) {
      return app.io.emit('statistics.getInvoiceStatistics', callback);
    };

    app.listeners.addLoadStatistics();
  });
})(app);
