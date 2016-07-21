/*
 global app
 */

if (! app) {
  var app = require('./app');
}

(function () {
  app.startup.push(function () {
    app.elements.ownInvoiceStatistics = document.getElementsByClassName('own-spending') [ 0 ];

    app.listeners.addLoadStatistics = function () {
      app.events.createCharts();
    };

    app.events.createCharts = function () {

      console.log('starting chart creation');
      var monthLabels = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
      ];

      app.connectors.getOwnInvoiceSum(function (error, data) {
        if (error) {
          // TODO: Render error image
          console.error(error);
        }

        app.charts.line(app.elements.ownInvoiceStatistics, 'own-spending', {
          labels:   monthLabels,
          datasets: [ {
            data:            data,
            label: 'Summe',
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor:     [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth:     1
          } ]
        });
      });
    };

    app.connectors.getInvoiceSumByUser = function (id, callback) {
      return app.io.emit('statistics.getInvoiceSumByUser', id, callback);
    };

    app.connectors.getOwnInvoiceSum = function (callback) {
      return app.io.emit('statistics.getInvoiceSumByUser', callback);
    };

    app.listeners.addLoadStatistics();
  });
})();
