'use strict';

/*
 global window,
 document,
 FormData,
 XMLHttpRequest,
 File,
 Headers,
 Request
 */

class HTTP {
  constructor (defaults) {
    this.setDefaults(defaults);
  }

  /**
   * creates and sends a GET request
   *
   * @param   {string|object}          url       the URL to GET or a configuration object
   * @param   {object|string}          [data]    optional query params as an object or string
   * @param   {function}               [success] optional success callback
   * @param   {function}               [failure] optional failure callback
   * @param   {object}                 [events]  optional object of XHR events
   * @returns {XMLHttpRequest|Promise}           the fulfilled request object
   */
  get (url, data, success, failure, events) {
    let options     = this._handleArguments(arguments),
        queryString = this._createQueryString(options.data);
    options.method  = 'GET';
    options.url += (queryString.length > 0 ? '?' + queryString : '');

    delete options.data;

    return this._request(options);
  }

  /**
   * creates and sends a DELETE request
   *
   * @param   {string|object}          url       the URL to POST to or a
   *                                             configuration object
   * @param   {object|FormData}        [data]    optional POST body
   * @param   {function}               [success] optional success callback
   * @param   {function}               [failure] optional failure callback
   * @param   {object}                 [events]  optional object of XHR events
   * @returns {XMLHttpRequest|Promise}           the fulfilled request object
   */
  delete (url, data, success, failure, events) {
    let options    = this._handleArguments(arguments);
    options.method = 'DELETE';

    return this._request(options);
  }

  head (url, data, success, failure, events) {
    let options    = this._handleArguments(arguments);
    options.method = 'HEAD';

    return this._request(options);
  }

  /**
   * creates and sends a POST request
   *
   * @param   {string|object}          url       the URL to POST to or a
   *                                             configuration object
   * @param   {object|FormData}        [data]    optional POST body
   * @param   {function}               [success] optional success callback
   * @param   {function}               [failure] optional failure callback
   * @param   {object}                 [events]  optional object of XHR events
   * @returns {XMLHttpRequest|Promise}           the fulfilled request object
   */
  post (url, data, success, failure, events) {
    let options    = this._handleArguments(arguments);
    options.data   = this._createRequestBody(options.data);
    options.method = 'POST';

    return this._request(options);
  }

  /**
   * creates and sends a PUT request
   *
   * @param   {string|object}          url       the URL to PUT to or a
   *                                             configuration object
   * @param   {object|FormData}        [data]    optional PUT body
   * @param   {function}               [success] optional success callback
   * @param   {function}               [failure] optional failure callback
   * @param   {object}                 [events]  optional object of XHR events
   * @returns {XMLHttpRequest|Promise}           the fulfilled request object
   */
  put (url, data, success, failure, events) {
    let options    = this._handleArguments(arguments);
    options.data   = this._createRequestBody(options.data);
    options.method = 'PUT';

    return this._request(options);
  }

  /**
   * creates and sends a PATCH request
   *
   * @param   {string|object}          url       the URL to PATCH to or a
   *                                             configuration object
   * @param   {object|FormData}        [data]    optional PUT body
   * @param   {function}               [success] optional success callback
   * @param   {function}               [failure] optional failure callback
   * @param   {object}                 [events]  optional object of XHR events
   * @returns {XMLHttpRequest|Promise}           the fulfilled request object
   */
  patch (url, data, success, failure, events) {
    let options    = this._handleArguments(arguments);
    options.data   = this._createRequestBody(options.data);
    options.method = 'PATCH';

    return this._request(options);
  }

  /**
   * opens an HTTP request. uses the fetch API if available or falls back to XHR.
   * options are supposed to be checked already since this is marked private, so
   * if you want to use _request directly, make sure to pass all required options.
   *
   * @private
   * @param   {object}                 options            the request options
   * @param   {string}                 options.method     the request method
   * @param   {string}                 options.url        the URL to request
   * @param   {FormData}               [options.data]     optional FormData object to send
   * @param   {function}               [options.success]  optional success callback
   * @param   {function}               [options.failure]  optional failure callback
   * @param   {function}               [options.complete] optional complete callback (called
   *                                                      regardless of request success)
   * @param   {object}                 [options.events]   optional object containing XHR
   *                                                      events
   * @param   {object}                 options.headers    optional object containing XHR
   * @returns {XMLHttpRequest|Promise}                    the request object. either a
   *                                                      promise or the XHR
   * @throws  {Error}                                     will throw if request fails
   */
  static _request (options) {

    // use the default options and merge them with individual ones
    options = Object.assign(this.getDefaults(), options);

    if (window.hasOwnProperty('fetch')) {
      return this._fetchRequest(options);
    } else {
      return this._xhrRequest(options);
    }
  }

  static _fetchRequest (options) {
    let headers = new Headers(options.headers),
        request,
        response;

    if (options.data instanceof FormData) {

      /**
       * check if any formData entry is a file and adjust the content type
       *
       * @see http://stackoverflow.com/a/35799817/2532203
       */
      for (let pair of options.data.entries()) {
        if (pair[ 1 ] instanceof File) {
          headers.delete('Content-Type');
        }
      }
    }

    request = new Request(url, {
      method:      method,
      body:        data,
      credentials: 'include',
      headers:     headers
    });

    return window.fetch(request)
      .then(function(responsePromise) {
        response = responsePromise;
        if (response.status !== 204) {
          return responsePromise.json();
        }

        return '';
      })
      .then(function(responseText) {
        response.responseText = responseText;

        if (response.ok) {
          success.call(this, response);
        } else {
          failure.call(this, response);
        }

        complete.call(this, response);

        return response;
      }, function(error) {
        failure.call(this, error);
        complete.call(this, error);

        return error;
      });
  }

  static _xhrRequest (options) {
  }

  /**
   * creates a query string
   *
   * @private
   * @param   {object} queryData the query data as key-value pairs
   * @returns {string}           the stringified query data 
   * @throws  {Error}            will throw if the data is not parsable
   */
  static _createQueryString (queryData) {
    let queryString;

    if (Object.keys(queryData).length === 0) {
      return '';
    }

    try {
      queryString = Object
        .keys(queryData)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryData[ key ])}`)
        .join('&');
    } catch (error) {
      throw new Error(`Could not create query string: ${error.message}`);
    }

    return queryString;
  }

  /**
   * parses a query string
   *
   * @private
   * @param   {string} queryString the query string to parse
   * @returns {object}             the parsed query data
   * @throws  {Error}              will throw if the data is not parsable
   */
  static _parseQueryString (queryString) {
    let queryData;

    if (queryString.length === 0) {
      return {};
    }

    try {
      queryData = queryString
        .split('&')
        .reduce((params, param) => {
          let [ key, value ] = param.split('=');
          params[ key ]      = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
          return params;
        }, {});
    } catch (error) {
      throw new Error(`Could not parse query string: ${error.message}`);
    }

    return queryData;
  }

  /**
   * creates a request body as FormData from an object
   *
   * @private
   * @param   {object}   data the key-value pairs to be submitted
   * @returns {FormData}      the request body as FormData object
   * @throws  {Error}         will throw if a wrong argument is passed
   */
  static _createRequestBody (data) {

    // if data is no object, this seems to be a wrong parameter
    if (typeof data !== 'object') {
      throw new Error(`Wrong request data format ${typeof data}`);
    }

    // check if we have a FormData object already
    if (data instanceof FormData) {
      return data;
    }

    // check if we have keys at all
    if (Object.keys(data).length === 0) {
      return new FormData();
    }

    const body = new FormData();

    // iterate over data
    for (let key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }

      // append the current set to the body object
      body.append(key, data[ key ]);
    }

    return body;
  }

  /**
   * handle the call arguments and provide uniform object output
   *
   * @private
   * @param   {Arguments} originalArguments the original function call arguments
   * @returns {object}                      the parsed arguments as key-value pairs
   * @throws  {Error}                       will throw if arguments are missing or
   *                                        in a wrong data type.
   */
  static _handleArguments (originalArguments) {
    let args       = Array.from(originalArguments),
        argsLength = args.length,
        options    = {};

    // check if we have at least a URL
    if (argsLength === 0) {
      throw new Error('Missing required parameter URL');
    }

    // check whether we have an options object
    if (argsLength === 1 && Object(args[ 0 ]) === args[ 0 ]) {

      // if there is a URL, the args are assumed to be valid
      if (args[ 0 ].hasOwnProperty('url')) {
        return args[ 0 ];
      } else {
        throw new Error('Missing required parameter URL');
      }
    }

    // check whether URL has been given
    if (typeof args[ 0 ] !== 'undefined') {
      if (typeof args[ 0 ] !== 'function') {
        throw new Error(`Wrong type ${typeof args[ 0 ]} for URL`);
      }

      options.url = args[ 0 ];
    }

    // check whether a data object has been given (type check performed later)
    if (typeof args[ 1 ] !== 'undefined') {
      options.data = args[ 1 ];
    }

    // check whether a success callback has been given
    if (typeof args[ 2 ] !== 'undefined') {
      if (typeof args[ 2 ] !== 'function') {
        throw new Error(`Wrong type ${typeof args[ 2 ]} for success callback`);
      }

      options.success = args[ 2 ]
    }

    // check if a failure callback has been given
    if (typeof args[ 3 ] !== 'undefined') {
      if (typeof args[ 3 ] !== 'function') {
        throw new Error(`Wrong type ${typeof args[ 3 ]} for failure callback`);
      }

      options.failure = args[ 3 ];
    }

    // check if events have been given
    if (typeof args[ 4 ] !== 'undefined') {
      if (Object(args[ 4 ]) !== args[ 4 ]) {
        throw new Error(`Wrong type ${typeof args[ 4 ]} for events object`);
      }

      options.events = args[ 4 ];
    }

    // if we have only a single callback, we'll use it for the complete
    // event and remove the success listener. this won't change a thing
    // if we only need a success case but leaves us to deal with the
    // error if we decide not to handle it explicitly.
    if (options.hasOwnProperty('success') && !options.hasOwnProperty('failure')) {
      options.complete = options.success;
      delete options.success;
    }

    if (typeof options.headers === 'undefined') {
      options.headers = {};
    }

    return options;
  }

  /**
   * sets the default options for each request
   *
   * @param {object} options
   */
  static setDefaults (options) {
    HTTP.defaults = Object.assign({}, options);
  }

  /**
   * retrieves the default options for each request
   *
   * @returns {object}
   */
  static getDefaults () {
    if (!HTTP.hasOwnProperty('defaults')) {
      HTTP.defaults = {};
    }

    return HTTP.defaults;
  }
}
