'use strict';

/*
 global module,
 require,
 process,
 __dirname
 */

var cluster = require('cluster'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),

    async = require('async'),
    colors = require('colors'),
    nconf = require('nconf'),
    moment = require('moment'),
    winston = require('winston'),

    runningInstance = true,
    runningInstancePidFile,
    runningInstancePid;

// load config
nconf.file({ file: path.resolve(path.join(__dirname, 'config.json')) });

// store the apps base path
nconf.set('path', path.resolve(__dirname));

// setup the logger
setupLogger();

// try to retrieve the PID of the running process from its lock file. If it does not exist,
// we will assume there is no running instance yet.
try {
  runningInstancePidFile = fs.readFileSync('./pidfile', 'utf-8');
  runningInstancePid = parseInt(runningInstancePidFile, 10);
}
catch (error) {
  runningInstance = false;
}

/**
 * register process event handlers
 */
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', exceptionHandler);

start();

/**
 * Starts the app
 */
function start() {
  // write lock file
  fs.writeFileSync('./pidfile', process.pid);

  winston.info('WG-Abrechnung v%s, Copyright (C) 2016 Moritz Friedrich', nconf.get('version'));
  winston.info('Developed by Moritz Friedrich (MoritzFriedrich.com).');
  winston.info('This program comes with ABSOLUTELY NO WARRANTY.');
  winston.info('It is free software, and you are welcome to redistribute it under certain conditions.');
  winston.info('');
  winston.info('[app]'.white + ' Started app with PID %s', process.pid.toString().bold);

  // prepare the assets
  prepareAssets();

  var webserver = require('./src/server'),
      sockets = require('./src/socket.io');

  // start the server
  sockets.initialize(webserver.server);
  webserver.listen(nconf.get('port'));
}

/**
 * Formats and logs critical exceptions to STDOUT before shutting down
 *
 * @param {Error} error  the exception object
 * @returns void
 */
function exceptionHandler(error) {
  var path = nconf.get('path'),
      stack = (stack ? error.stack.toString().split(path).join('') : ''),
      origin;

  try {
    origin = error.stack.match((new RegExp(path.replace(/\//g, '\\/') + '\/(.*)+:([0-9]+):([0-9]+)'))).slice(1);
  }
  catch (e) {
    origin = [ '[module internal]', '', '' ];
  }

  var file = origin[ 0 ].split(path).join('') + (origin[ 0 ].indexOf('(') !== - 1 ? ')' : ''),
      line = origin[ 1 ];
console.log(error); process.exit();
  console.error('');
  console.error("Critical ".bold.white + (error.hasOwnProperty('name') ? error.name : 'Error').bold.white);
  console.error(error.message.bgRed.white + "\n");
  console.error('Origin'.bold.white);
  console.error(file.bgRed.white + ' on line '.bgRed.white + line.bgRed.white + "\n");
  console.error('Trace'.bold.white);
  console.error(stack.red + "\n");
  shutdown(1);
}

/**
 * Shuts the app down
 *
 * @param {number} [code]  an optional exit code
 * @returns {number}       the exit code to return to the shell
 */
function shutdown(code) {
  if (code > 0) {
    winston.error('[app]'.white + ' Shutting down process ' + process.pid.toString().bold + ' due to an error.');
  } else {
    winston.info('[app]'.white + ' Shutting down process ' + process.pid.toString().bold + ' gracefully.');
  }

  // remove lock file
  try {
    fs.unlinkSync('./pidfile');
  } catch (error) {
    winston.error('[app]'.white + ' Could not remove PIDFile, you will have to do this by yourself to start the app again.');
  }

  return process.exit(code || 0);
}

/**
 *
 */
function prepareAssets() {
  var templates = require('./src/meta/templates'),
     // stylesheets = require('./src/meta/stylesheets'),
      javascripts = require('./src/meta/javascripts');

  // compile templates
  templates.compile();

  // compile SASS files to CSS
  //stylesheets.compile();

  // Skip CSS minification if debug mode is enabled
  if (nconf.get('assets:options:skipCSSMinification') === false) {

    // minify CSS files
    // stylesheets.minify();
  }

  // concatenate client JS
  //javascripts.concatenate();

  if (nconf.get('assets:options:skipJSMinification') === false) {

    // minify client JS
    javascripts.minify();
  }
}

/**
 * Configures Winston Logger
 */
function setupLogger() {
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    timestamp:   function () {
      return moment().format('D.mm.YYYY @ HH:mm:ss:SSS');
    },
    prettyPrint: true,
    colorize:    (nconf.get('logging:silent') === false),
    level:       (nconf.get('environment') === 'development' ? 'silly' : 'info')
  });

/*
  winston.add(winston.transports.File, {
    filename:    'logs/output.log',
    colorize:    false,
    timestamp:   true,
    maxsize:     1000000,
    maxFiles:    10,
    json:        false,
    prettyPrint: true,
    showLevel:   true,
    tailable:    true,
    level:       'silly'
  });
*/
}
