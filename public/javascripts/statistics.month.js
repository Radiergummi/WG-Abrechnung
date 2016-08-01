/*
 global app
 */

if (!app) {
  var app = require('./app');
}

(function() {
  app.startup.push(function() {
    app.elements.ownInvoiceStatistics = document.getElementsByClassName('flat-spending-by-month') [ 0 ];

    app.listeners.addLoadStatistics = function() {
      app.events.createCharts();
    };

    app.events.createCharts = function() {
      var month = app.elements.ownInvoiceStatistics.dataset.month;
      app.connectors.getSpendingStatisticsByMonth(new Date(new Date().getFullYear(), month, 0), function(error, data) {
        if (error) {
          // TODO: Render error image
          console.error(error);
        }

        app.charts.line(app.elements.ownInvoiceStatistics, 'flat-spending-by-month', data);
      });
    };

    app.connectors.getInvoiceSumByUser = function(id, callback) {
      return app.io.emit('statistics.getInvoiceSumByUser', id, callback);
    };

    app.connectors.getOwnInvoiceSum = function(callback) {
      return app.io.emit('statistics.getInvoiceSumByUser', callback);
    };

    app.connectors.getSpendingStatisticsByMonth = function(month, callback) {
      console.log('emitting getSpendingStatisticsByMonth');
      return app.io.emit('statistics.getSpendingStatisticsByMonth', month, callback);
    };

    app.listeners.addLoadStatistics();
  });
})();
