'use strict';

(function(translator) {
  var translationRegex = /\[\[\w+:[\w\.]+((?!\[\[).)*?\]\]/g,
      debug;

  if (typeof module !== 'undefined' && module.exports) {
    debug   = require('debug')('flatm8:translator');
    module.exports = translator;
  } else {
    if (window.hasOwnProperty('debug') && window.debug) {
      debug = console.debug.bind(console);
    } else {
      debug = function() {
      }
    }

    window[ 'translator' ] = translator;
  }

  var languages = {};


  translator.escape = function(text) {
    return typeof text === 'string' ? text.replace(/\[\[([\S]*?)\]\]/g, '\\[\\[$1\\]\\]') : text;
  };

  translator.unescape = function(text) {
    return typeof text === 'string' ? text.replace(/\\\[\\\[([\S]*?)\\\]\\\]/g, '[[$1]]') : text;
  };

  translator.addLanguage = function(code, translations) {
    languages[ code ] = translations;
  };

  translator.getLanguage = function(code) {
    return languages[ code ];
  };

  translator.translate = function(text, language, callback) {
    debug('translating %s', (text.length > 10 ? text.substring(0, 10) + '...' : text));

    if (typeof language === 'function') {
      callback = language;
      language = 'en_US';
    }

    // if we received no text, return whatever came
    if (!text) {
      debug('got no text, return initial value');
      return callback(text);
    }

    // check the input for translation indicators
    var keys = text.match(translationRegex);

    // if we have no translation indicators, return whatever came
    if (!keys) {
      debug('no translation indicators, return initial value');
      return callback(text);
    }

    /**
     * translate the keys. In case we have multiple translations in the input
     * text, we run a callback on finish that tries to match the indicator
     * regex again. If it matches, we run the translateKeys function again.
     */
    return translator.translateKeys(keys, text, language, function(translated) {
      keys = translated.match(translationRegex);

      if (!keys) {
        debug('got no more keys');
        return callback(translated);
      } else {
        debug('translating left keys');
        return translator.translateKeys(keys, translated, language, callback);
      }
    });
  };

  /**
   * translates multiple keys by running translateKey on them.
   *
   * @param   {Array}    keys      an array of keys to translate
   * @param   {string}   text      possibly already translated text
   * @param   {string}   language  the language to translate to
   * @param   {function} callback  a callback to run once the keys have been translated
   * @returns {*}
   */
  translator.translateKeys = function(keys, text, language, callback) {
    var keyCount = keys.length;

    debug('translating %s keys', keyCount);

    if (!keyCount) {
      debug('got no more keys');
      return callback(text);
    }

    var data = {
      text: text
    };

    // iterate over keys
    keys.forEach(function(key) {
      debug('processing key %s', key);

      // translate the key
      translator.translateKey(key, data, language, function(translated) {

        debug('translated %s to %s', key, (translated.text.length > 10 ? translated.text.substring(0, 10) + '...' : translated.text));

        // decrement the key counter to know when to run the callback on
        // the last key
        keyCount--;

        if (keyCount <= 0) {
          return callback(translated.text);
        }
      });
    });
  };

  /**
   * translates a key by parsing the translator string, loading the appropriate language file
   * if necessary.
   *
   * @param   {string}   key        the key to translate
   * @param   {object}   data       carrier object reference to translate multiple keys
   * @param   {string}   data.text  the translated text
   * @param   {string}   language   the language to translate to
   * @param   {function} callback   a callback to apply on the translated string
   * @returns {*}
   */
  translator.translateKey = function(key, data, language, callback) {

    debug('translating key %s into %s', key, language);

    // stringify key
    key           = '' + key;
    var variables = key.split(/[,][\s]*/);

    debug('key "%s" contains %s variable(s)', key, variables.length - 1);

    // remove indicator signs, split by category separator
    var parsedKey = key.replace('[[', '').replace(']]', '').split(':');
    parsedKey     = [ parsedKey[ 0 ] ].concat(parsedKey.slice(1).join(':'));

    // if we don't have category and string name, return whatever came
    if (!(parsedKey[ 0 ] && parsedKey[ 1 ])) {
      return callback(data);
    }

    var category = parsedKey[ 0 ],
        value    = ('' + parsedKey[ 1 ]).split(',')[ 0 ];

    debug('key %s indicates category "%s" and value "%s"', key, category, value);

    // load the language file if not available
    return translator.loadLanguage(language, function(languageData) {

      debug('loaded language %s', language);

      if (!languageData.hasOwnProperty(category)) {
        return callback(key);
      }

      // retrieve the translation string from the languages object
      var string = languageData[ category ][ value ];

      debug('translation for %s:%s was found', category, value);

      // if we found a translation at all, replace variables
      if (string) {

        // iterate over variables
        for (var i = 1; i < variables.length; i++) {
          debug('replacing variable %s', variables[ i ].replace(']]', ''));

          // replace %i with the variable content
          string = string.replace('%' + i, function() {
            return variables[ i ].replace(']]', '');
          });
        }

        // replace the original key with the translation
        data.text = data.text.replace(key, function() {
          return string;
        });
      } else {
        string    = key.split(':');
        data.text = data.text.replace(key, string[ string.length - 1 ].replace(']]', ''))
      }

      // return the callback with the updated reference
      return callback(data);
    });
  };

  /**
   * load a language from file if not loaded yet. works in both server and client-side environments.
   *
   * @param   {string} language    the language code
   * @param   {function} callback  a callback to execute once the language is ready
   * @returns {*}
   */
  translator.loadLanguage = function(language, callback) {

    debug('loading language %s', language);

    // if the language is loaded, return early
    if (languages.hasOwnProperty(language)) {

      debug('language %s has been loaded already', language);
      return callback(languages[ language ]);
    }

    // whether we are within a Node.JS context or a browser context
    if (typeof window === 'undefined') {
      debug('translator is running on server side');
      return loadLanguageFileServer(language, callback);
    } else {
      debug('translator is running on client side');
      return loadLanguageFileClient(language, callback);
    }
  };

  function loadLanguageFileClient (language, callback) {
    if (window.fetch) {
      debug('fetch API is available');

      /**
       * Yay, fetch API is available!
       */
      return fetch('/translations/' + language + '.json').then(function(response) {
        if (response.ok) {
          debug('response is okay. parsing JSON');

          return response.json().then(function(data) {
            debug('received translation file for %s', language);

            languages[ language ] = data;

            return callback(languages[ language ]);
          });
        } else {

          return debug('Could not fetch %s translation file', language);
        }
      })
    } else {
      debug('fetch API is not available');

      /**
       * No fetch API... falling back to XMLHttpRequest.
       * @type {XMLHttpRequest}
       */
      var request = new XMLHttpRequest();
      request.overrideMimeType("application/json");
      request.open('GET', '/translations/' + language + '.json', true);
      request.onreadystatechange = function() {

        // when the data is available, fire the callback
        if (request.readyState == 4 && request.status == "200") {

          debug('response is okay. parsing JSON');
          languages[ language ] = JSON.parse(request.responseText);

          debug('received translation file for %s', language);
          return callback(languages[ language ]);
        } else {
          return debug('Could not fetch %s translation file', language);
        }
      };

      debug('sending request for translation file');
      request.send(null);
    }
  }

  function loadLanguageFileServer (language, callback) {
    try {
      debug('trying to require language file for %s', language);
      languages[ language ] = require('../../../translations/' + language + '.json');
    }
    catch (error) {
      debug('could not require language file for %s (%s)', language, error.message);
      throw new Error('Language file could not be loaded. Shutting down.');
    }

    return callback(languages[ language ]);
  }

})(
  (typeof module !== 'undefined' && typeof module.exports === 'object'
      ? module.exports
      : {}
  )
);
