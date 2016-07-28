'use strict';

(function() {
  var translator = (function() {
    var translationRegex = /\[\[\w+:[\w\.]+((?!\[\[).)*?\]\]/g;

    this.languages = {};

    this.loadLanguage = function(code, translations) {
      this.languages[ code ] = translations;
    };

    this.translate = function(text, language, callback) {
      if (typeof language === 'function') {
        callback = language;
        language = 'en_EN';
      }

      // if we received no text, return whatever came
      if (!text) {
        return callback(text);
      }

      // check the input for translation indicators
      var keys = text.match(translationRegex);

      // if we have no translation indicators, return whatever came
      if (!keys) {
        return callback(text);
      }

      /**
       * translate the keys. In case we have multiple translations in the input
       * text, we run a callback on finish that tries to match the indicator
       * regex again. If it matches, we run the translateKeys function again.
       */
      return translateKeys(keys, text, language, function(translated) {
        keys = translated.match(translationRegex);

        if (!keys) {
          return callback(translated);
        } else {
          return translateKeys(keys, translated, language, callback);
        }
      });
    };


    this.escape = function(text) {
      return typeof text === 'string' ? text.replace(/\[\[([\S]*?)\]\]/g, '\\[\\[$1\\]\\]') : text;
    };

    this.unescape = function(text) {
      return typeof text === 'string' ? text.replace(/\\\[\\\[([\S]*?)\\\]\\\]/g, '[[$1]]') : text;
    };
  })();


  /**
   * translates multiple keys by running translateKey on them.
   *
   * @param   {Array}    keys      an array of keys to translate
   * @param   {string}   text      possibly already translated text
   * @param   {string}   language  the language to translate to
   * @param   {function} callback  a callback to run once the keys have been translated
   * @returns {*}
   */
  function translateKeys (keys, text, language, callback) {
    var keyCount = keys.length;

    if (!keyCount) {
      return callback(text);
    }

    var data = {
      text: text
    };

    // iterate over keys
    keys.forEach(function(key) {

      // translate the key
      translateKey(key, data, language, function(translated) {

        // decrement the key counter to know when to run the callback on
        // the last key
        keyCount--;

        if (keyCount <= 0) {
          return callback(translated.text);
        }
      });
    });
  }

  function translateKey (key, data, language, callback) {

    // stringify key
    key = '' + key;

    // remove indicator signs, split by category separator
    var parsedKey = key.replace('[[', '').replace(']]', '').split(':');
    parsedKey     = [ parsedKey[ 0 ] ].concat(parsedKey.slice(1).join(':'));

    // if we don't have category and string name, return whatever came
    if (!(parsedKey[ 0 ] && parsedKey[ 1 ])) {
      return callback(data);
    }

    var parsedValue = parsedKey[ 1 ].split('.');

    //  TODO: Actual translation
    loadLanguage(language, function(languageData) {
      
    });
  }


  function loadLanguage(language, callback) {
    if (translator.languages.hasOwnProperty(language)) {
      return callback(translator.languages[language]);
    }

    if (typeof window === 'undefined') {
      data = require('../../translations/' + language + '.json');
      translator.languages[language] = data;
    } else {
      if (window.fetch) {
        fetch('/translations/' + language + '.json').then(function(response) {
          if (response.ok) {
            response.json().then(function(data) {
              translator.languages[language] = data;

              return callback(translator.languages[language]);
            });
          } else {
            console.error('Could not fetch translation file');
          }
        })
      } else {
        // TODO: XmlHttpRequest fallback
      }
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = translator;
  } else {
    window[ 'translator' ] = translator;
  }
})();
