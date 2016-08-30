'use strict';

module.exports = function(app) {
  var Charts = require('chart.js');

  Charts.defaults.global.spanGaps                            = false;
  Charts.defaults.global.defaultFontFamily                   = "'Brandon Grotesque', 'Roboto', 'Lucida Grande', 'Verdana', sans-serif";
  Charts.defaults.global.defaultFontSize                     = 14;
  Charts.defaults.global.elements.line.tension               = 0;
  Charts.defaults.global.elements.line.fill                  = true;
  Charts.defaults.global.elements.line.borderJoinStyle       = 'round';
  Charts.defaults.global.elements.line.borderCapStyle        = 'butt';
  Charts.defaults.global.elements.line.borderDash            = [];
  Charts.defaults.global.elements.line.borderDashOffset      = 0.0;
  Charts.defaults.global.elements.point.radius               = 2;
  Charts.defaults.global.elements.point.hitRadius            = 10;
  Charts.defaults.global.elements.point.borderWidth          = 3;
  Charts.defaults.global.elements.point.hoverRadius          = 4;
  Charts.defaults.global.elements.point.hoverBorderWidth     = 3;
  Charts.defaults.global.elements.point.hoverBackgroundColor = "#fff";
  Charts.defaults.global.tooltips.mode                       = 'single';
  Charts.defaults.global.tooltips.titleFontSize              = 16;
  Charts.defaults.global.tooltips.bodySpacing                = 6;
  Charts.defaults.global.tooltips.titleMarginBottom          = 16;
  Charts.defaults.global.tooltips.cornerRadius               = 4;
  Charts.defaults.global.tooltips.caretSize                  = 8;
  Charts.defaults.global.tooltips.xPadding                   = 10;
  Charts.defaults.global.tooltips.yPadding                   = 10;

  app.charts = {
    prepare: function(container, id, data) {
      var canvas;

      /**
       * use existing canvas or create a new one
       */
      if (container.getElementsByTagName('canvas').length !== 0) {
        canvas = container.getElementsByTagName('canvas')[ 0 ];
      } else {

        // create a new chart canvas
        canvas = app.helpers.createNode('canvas', {
          class:  'chart',
          id:     'id',
          width:  container.offsetWidth,
          height: container.offsetHeight
        });

        // append canvas to the container
        container.appendChild(canvas);
      }

      return new Charts(canvas.getContext('2d'), data);
    },

    line: function(container, id, data) {
      return this.prepare(container, id, {
        type:    'line',
        data:    data,
        options: {
          scales: {
            yAxes: [ {
              ticks: {
                beginAtZero: true
              }
            } ]
          }
        }
      });
    }
  };
};
