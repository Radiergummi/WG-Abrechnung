'use strict';

/*
 global module,
 require
 */

/**
 * translates text in arbitrary languages
 */
class Translator {

  /**
   * create a new translator instance
   */
  constructor () {

    /**
     * the language cache
     *
     * @type {object}
     */
    this.languages = {};

    /**
     * create the debugger function. will use the debug module
     * in node and console.debug in browsers
     *
     * @type {function}
     */
    this.debug = (Translator.isBrowser()
        ? /*(window.debug) ?*/ (...args) => console.debug(...args) /*: () => {
       }*/
        : require('debug')('flatm8:translator')
    );
  }

  /**
   * translate a text with one or more translation strings
   *
   * @param   {string}           text the text to translate
   * @param   {string}           languageCode the language to translate to
   * @returns {Promise.<string>} the translated text
   */
  translate (text, languageCode) {
    this.debug('going to translate %s', text.substring(0, 50));

    if (typeof languageCode === 'undefined') {
      languageCode = Translator.getLanguage();
    }

    // regex for valid text in namespace / key
    const validText        = 'a-zA-Z0-9\\-_.\\/',
          validTextRegex   = new RegExp('[' + validText + ']'),
          invalidTextRegex = new RegExp('[^' + validText + '\\]]');

    // current cursor position
    let cursor = 0;

    // last break of the input string
    let lastBreak = 0;

    // length of the input string
    let textLength = text.length;

    // array to hold the promises for the translations
    // and the strings of untranslated text in between
    let toTranslate = [];

    /**
     * split a translator string into an array of tokens, but
     * don't split by commas inside other translator strings
     *
     * @param   {string} text the text to split
     * @returns {Array}       a list of matches
     */
    function split (text) {
      let textLength = text.length,
          results    = [],
          iteration  = 0,
          brk        = 0,
          level      = 0;

      // iterate over every two characters
      while (iteration + 2 <= textLength) {

        // if we have a translator token
        if (text.slice(iteration, iteration + 2) === '[[') {
          level += 1;
          iteration += 1;
        } else if (text.slice(iteration, iteration + 2) === ']]') {
          level -= 1;
          iteration += 1;
        } else if (
          level === 0 &&
          text[ iteration ] === ',' &&
          text[ iteration - 1 ] !== '\\'
        ) {
          results.push(text.slice(brk, iteration).trim());
          iteration += 1;
          brk = iteration;
        }
        iteration += 1;
      }
      results.push(text.slice(brk, textLength + 1).trim());

      return results;
    }

    // the loooop, we'll go to where the cursor
    // is equal to the length of the string since
    // slice doesn't include the ending index
    while (cursor + 2 <= textLength) {

      // if the current position in the string looks
      // like the beginning of a translation string
      if (text.slice(cursor, cursor + 2) === '[[') {

        // split the string from the last break
        // to the character before the cursor
        // add that to the result array
        toTranslate.push(text.slice(lastBreak, cursor));

        // set the cursor position past the beginning
        // brackets of the translation string
        cursor += 2;

        // set the last break to our current
        // spot since we just broke the string
        lastBreak = cursor;

        // the current level of nesting of the translation strings
        let level = 0,
            sliced;

        // validating the current string is actually a translation
        let textBeforeColonFound = false,
            colonFound           = false,
            textAfterColonFound  = false,
            commaAfterNameFound  = false;

        while (cursor + 2 <= textLength) {
          sliced = text.slice(cursor, cursor + 2);

          // found some text after the double bracket,
          // so this is probably a translation string
          if (
            !textBeforeColonFound &&
            validTextRegex.test(sliced[ 0 ])
          ) {
            textBeforeColonFound = true;
            cursor += 1;

            // found a colon, so this is probably a translation string
          } else if (
            textBeforeColonFound && !colonFound &&
            sliced[ 0 ] === ':'
          ) {
            colonFound = true;
            cursor += 1;

            // found some text after the colon,
            // so this is probably a translation string
          } else if (
            colonFound && !textAfterColonFound &&
            validTextRegex.test(sliced[ 0 ])
          ) {
            textAfterColonFound = true;
            cursor += 1;
          } else if (
            textAfterColonFound && !commaAfterNameFound &&
            sliced[ 0 ] === ','
          ) {
            commaAfterNameFound = true;
            cursor += 1;

            // a space or comma was found before the name
            // this isn't a translation string, so back out
          } else if (
            !(
              textBeforeColonFound &&
              colonFound &&
              textAfterColonFound &&
              commaAfterNameFound
            ) &&
            invalidTextRegex.test(sliced[ 0 ])
          ) {
            cursor += 1;
            lastBreak -= 2;

            if (level > 0) {
              level -= 1;
            } else {
              break;
            }

            // if we're at the beginning of another translation string,
            // we're nested, so add to our level

          } else if (sliced === '[[') {
            level += 1;
            cursor += 2;

            // if we're at the end of a translation string
          } else if (sliced === ']]') {

            // if we're at the base level, then this is the end
            if (level === 0) {

              // so grab the name and args
              let result = split(text.slice(lastBreak, cursor)),
                  name   = result[ 0 ],
                  args   = result.slice(1);

              // add the translation promise to the array
              toTranslate.push(this.translateKey(name, args, languageCode));

              // skip past the ending brackets
              cursor += 2;

              // set this as our last break
              lastBreak = cursor;

              // and we're no longer in a translation string,
              // so continue with the main loop
              break;
            }

            // otherwise we lower the level
            level -= 1;

            // and skip past the ending brackets
            cursor += 2;
          } else {

            // otherwise just move to the next character
            cursor += 1;
          }
        }
      }

      // move to the next character
      cursor += 1;
    }

    // add the remaining text after the last translation string
    toTranslate.push(text.slice(lastBreak, cursor + 2));

    // and return a promise for the concatenated translated string
    return Promise
      .all(toTranslate)
      .then(translated => translated.join(''));
  }

  /**
   * translates a translation key
   *
   * @param   {string}           name         the name of the key to translate
   * @param   {Array}            args         arguments for the translation
   * @param   {string}           languageCode the code of the language to translate to
   * @returns {Promise.<string>}              the translated string
   */
  translateKey (name, args, languageCode) {
    this.debug(`translating key ${name}`);

    let result    = name.split(':', 2),
        namespace = result[ 0 ],
        key       = result[ 1 ];

    if (namespace && !key) {
      this.debug(`Missing key in translation token "${name}"`);

      return Promise.resolve('[[' + namespace + ']]');
    }

    const translation     = this.getTranslation(languageCode, namespace, key),
          argsToTranslate = args
            .map((arg) => Translator.prepareString(arg))
            .map((arg) => this.translate(arg));

    // so we can await all promises at once
    argsToTranslate.unshift(translation);

    return Promise.all(argsToTranslate).then((result) => {
      let translated     = result[ 0 ],
          translatedArgs = result.slice(1);

      if (!translated) {
        this.debug(`Missing translation "${name}"`);

        return key;
      }

      let out = translated;

      translatedArgs.forEach((arg, iteration) => {
        let escaped = arg.replace(/%/g, '&#37;').replace(/\\,/g, '&#44;');
        out         = out.replace(new RegExp('%' + (iteration + 1), 'g'), escaped);
      });

      return out;
    });
  }

  /**
   * prepares a string for translation by performing several steps:
   *  1. collapse white-space
   *  2. decode HTML entities
   *  3. encode HTML
   *
   * @param   {string} text the text to prepare
   * @returns {string}
   */
  static prepareString (text) {
    let encodeMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '/': '&#x2F;',
          '`': '&#x60;',
          '=': '&#x3D;'
        },
        decodeMap = {
          'amp':  '&',
          'apos': '\'',
          '#x27': '\'',
          '#x2F': '/',
          '#39':  '\'',
          '#47':  '/',
          'lt':   '<',
          'gt':   '>',
          'nbsp': ' ',
          'quot': '"'
        };

    return String(text)

    // collapse whitespace
      .replace(/\s+/g, ' ')

      // decode HTML entities
      .replace(/&([^;]+);/gm, function(match, entity) {
        return decodeMap[ entity ] || match
      })

      // encode HTML
      .replace(/[&<>"'`=\/]/g, function(s) {
        return encodeMap[ s ];
      });
  }

  /**
   * escapes a text string in the translator format
   *
   * @static
   * @param   {string} text the unescaped string
   * @returns {string}      the escaped string
   */
  static escape (text) {
    return (typeof text === 'string'
        ? text.replace(/\[\[([\S]*?)\]\]/g, '\\[\\[$1\\]\\]')
        : text
    );
  }

  /**
   * un-escapes a text string
   *
   * @static
   * @param   {string} text the escaped string
   * @returns {string}      the unescaped string
   */
  static unescape (text) {
    return (typeof text === 'string'
        ? text.replace(/\\\[\\\[([\S]*?)\\\]\\\]/g, '[[$1]]')
        : text
    );
  }

  /**
   * get the default language
   *
   * @returns {string}
   */
  static getLanguage () {
    if (typeof window !== 'undefined' && document.documentElement.lang) {
      return document.documentElement.lang;
    }

    return 'de_DE';
  }

  static isBrowser () {
    return (new Function("try {return this===window;}catch(e){ return false;}"))();
  }

  /**
   * adds a language to the cache
   *
   * @param {string} languageCode the language code
   * @param {object} translations the translation strings
   */
  addLanguage (languageCode, translations) {
    this.languages[ languageCode ] = translations;
  }

  /**
   * retrieves a translation from cache
   *
   * @param   {string} languageCode               the translation namespace
   * @param   {string} [namespace]                the namespace of the translation key
   * @param   {string} [key]                      the name of the translation key
   * @returns {Promise.<object>|Promise.<string>} the translation strings or the translated key
   */
  getTranslation (languageCode, namespace, key) {
    let translation;

    translation = this.loadLanguage(languageCode).catch(function() {
      return {};
    });

    if (typeof namespace === 'string') {
      if (typeof key === 'string') {
        return translation.then(data => {
          if (!data.hasOwnProperty(namespace) || !data[ namespace ].hasOwnProperty(key)) {
            return '';
          }

          return data[ namespace ][ key ];
        });
      }

      return translation.then(data => data[ namespace ]);
    }

    return translation;
  }

  /**
   * loads a language file. determines environment and calls
   * the matching loader function
   *
   * @param   {string}           languageCode
   * @returns {Promise.<object>}
   */
  loadLanguage (languageCode) {

    // check if we have the language in cache
    if (this.languages.hasOwnProperty(languageCode)) {
      this.debug(`language ${languageCode} has already been loaded`);

      // the language has been loaded already, so resolve it
      return Promise.resolve(this.languages[ languageCode ]);
    }

    // TODO: Replace this with a more sophisticated check
    if (Translator.isBrowser()) {
      this.debug('seems to be a browser environment');

      // load the language file on the client, catch loading errors
      return this.loadLanguageFileClient(languageCode).catch(error => this.debug(error));
    }

    this.debug('seems to be a server environment');

    // load the language file on the server, catch loading errors
    return this.loadLanguageFileServer(languageCode).catch(error => this.debug(error));
  }

  /**
   * loads a language client side
   *
   * @param   {string}           languageCode
   * @returns {Promise.<Object>}
   */
  loadLanguageFileClient (languageCode) {
    this.debug(`trying to load language ${languageCode} client-side`);

    // check for fetch API availability
    if (window.hasOwnProperty('fetch')) {

      // fetch the translation
      return window.fetch(`/translations/${languageCode}.json`).then((response) => {
        if (response.ok) {
          this.debug('response is okay. parsing JSON');

          return response.json().then((data) => {
            this.debug('received translation file for %s', languageCode);

            this.languages[ languageCode ] = data;

            return this.languages[ languageCode ];
          });
        } else {
          debug(`Could not fetch ${languageCode} translation file`);
          return Promise.reject(`Could not fetch ${languageCode} translation file`);
        }
      })
    } else {
      this.debug('fetch API is not available');

      /**
       * No fetch API... falling back to XMLHttpRequest.
       *
       * @type {XMLHttpRequest}
       */
      return new Promise((resolve, reject) => {

        const request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.open('GET', '/translations/' + languageCode + '.json', true);
        request.onreadystatechange = () => {

          // when the data is available, fire the callback
          if (request.readyState == 4 && request.status == "200") {

            this.debug('response is okay. parsing JSON');
            this.languages[ languageCode ] = JSON.parse(request.responseText);

            this.debug('received translation file for %s', languageCode);
            return resolve(this.languages[ languageCode ]);
          } else {
            return reject(`Could not fetch ${languageCode} translation file`);
          }
        };

        this.debug('sending request for translation file');
        request.send(null);
      });
    }
  }

  /**
   * loads a language server side
   *
   * @param   {string}           languageCode
   * @returns {Promise.<Object>}
   */
  loadLanguageFileServer (languageCode) {
    const debug = this.debug;
    debug(`trying to load ${languageCode} server-side`);
    return new Promise((resolve, reject) => {
      try {
        this.languages[ languageCode ] = require(`../../../translations/${languageCode}.json`);

        debug(`language ${languageCode} has been required`);
        resolve(this.languages[ languageCode ]);
      }
      catch (error) {
        debug(`missing language file for ${languageCode}: ${error}`);
        this.languages[ languageCode ] = { missing: true };
        return reject({});
      }
    });
  }
}

module.exports = new Translator;
