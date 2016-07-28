'use strict';

/**
 * main client app
 */
var app = {
  elements:   {},
  listeners:  {},
  events:     {},
  helpers:    {},
  connectors: {},
  templates:  {},
  startup:    [],
  config:     {}
};

app.helpers.createNode = function (tagName, attributes, content) {
  var node = document.createElement(tagName);

  attributes = attributes || {};

  for (var attr in attributes) {
    node.setAttribute(attr, attributes[ attr ]);
  }

  if (content !== undefined) {
    if (content.tagName) {
      node.appendChild(content);
    } else {
      node.textContent = content;
    }
  }

  return node;
};

app.helpers.createElement = function (elementString) {
  var parser = new DOMParser();

  return parser.parseFromString(elementString, 'text/html').body.childNodes[ 0 ];
};

app.helpers.createTranslatedElement = function (elementString) {
  var parser = new DOMParser();

  return new Promise(function (resolve) {
    console.log('indeed! we are actually working with promises!');
    app.translator.translate(elementString, app.config.language, function (translatedElementString) {
      resolve(parser.parseFromString(translatedElementString, 'text/html').body.childNodes[ 0 ]);
    });
  });
};

/**
 * Debounce function from https://davidwalsh.name/javascript-debounce-function
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */
app.helpers.debounce = function (func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later   = function () {
      timeout = null;
      if (! immediate) func.apply(context, args);
    };
    var callNow = immediate && ! timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

app.connectors.getConfig = function (callback) {
  app.io.emit('app.getConfig', function (error, data) {
    if (error) {
      return console.error(error);
    }

    app.config = data;

    return callback();
  });
};

app.events.imageError = function (image) {
  image.onerror = '';
  image.src     = '/images/noImage.svg';
  image.classList.add('image-error');
  image.parentNode.title = 'Kein Bild verfügbar';

  return true;
};

app.charts = {
  configure: function () {
    app.Charts.defaults.global.spanGaps                            = true;
    app.Charts.defaults.global.defaultFontFamily                   = "'Brandon Grotesque', 'Roboto', 'Lucida Grande', 'Verdana', sans-serif";
    app.Charts.defaults.global.defaultFontSize                     = 14;
    app.Charts.defaults.global.elements.line.tension               = 0;
    app.Charts.defaults.global.elements.line.fill                  = true;
    app.Charts.defaults.global.elements.line.borderJoinStyle       = 'round';
    app.Charts.defaults.global.elements.line.borderCapStyle        = 'butt';
    app.Charts.defaults.global.elements.line.borderDash            = [];
    app.Charts.defaults.global.elements.line.borderDashOffset      = 0.0;
    app.Charts.defaults.global.elements.point.radius               = 2;
    app.Charts.defaults.global.elements.point.hitRadius            = 10;
    app.Charts.defaults.global.elements.point.borderWidth          = 3;
    app.Charts.defaults.global.elements.point.hoverRadius          = 4;
    app.Charts.defaults.global.elements.point.hoverBorderWidth     = 3;
    app.Charts.defaults.global.elements.point.hoverBackgroundColor = "#fff";
    app.Charts.defaults.global.tooltips.mode                       = 'single';
    app.Charts.defaults.global.tooltips.titleFontSize              = 16;
    app.Charts.defaults.global.tooltips.bodySpacing                = 6;
    app.Charts.defaults.global.tooltips.titleMarginBottom          = 16;
    app.Charts.defaults.global.tooltips.cornerRadius               = 4;
    app.Charts.defaults.global.tooltips.caretSize                  = 8;
    app.Charts.defaults.global.tooltips.xPadding                   = 10;
    app.Charts.defaults.global.tooltips.yPadding                   = 10;
  },

  prepare: function (container, id, data) {
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

    return new app.Charts(canvas.getContext('2d'), data);
  },

  line: function (container, id, data) {
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

app.init = function () {
  app.io         = io();
  app.Charts     = Chart;
  app.charts.configure();
  app.elements.overlay = document.getElementById('overlay');

  app.connectors.getConfig(function () {
    window.debug = app.config.debug;
    app.translator = translator;

    // call all startup scripts
    for (var i = 0; i < app.startup.length; i ++) {
      app.startup[ i ].call(app);
    }
  });
};
