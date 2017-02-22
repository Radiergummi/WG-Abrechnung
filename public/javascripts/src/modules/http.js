'use strict';

/*
 global window,
 document,
 File,
 Headers,
 Request,
 fetch
 */

module.exports = function(app) {
  app.http = {};

  /**
   * opens an HTTP request. uses the fetch API if available or falls back to XHR.
   *
   * @param   {string}                 method    the HTTP method
   * @param   {string}                 url       the request URL
   * @param   {string|object|FormData} [data]    a set of key-value pairs for GET requests or the body object
   * @param   {function}               [success] a success callback
   * @param   {function}               [failure] a failure callback
   * @param   {object}                 [events]  an object containing named events to attach to the request
   * @returns {XMLHttpRequest|Promise}           the request object. either a promise or the XHR
   */
  app.http.request = function(method, url, data, success, failure, events) {
    method = method.toUpperCase();
    data   = data || undefined;

    let complete = function() {
    };

    // shift callbacks
    if (typeof success === 'function' && typeof failure !== 'function') {
      complete = success;
      events   = failure || {};
      success  = function() {
      };
      failure  = function() {
      };
    } else {
      success = success || function() {
        };
      failure = failure || function() {
        };
      events  = events || {};
    }

    if (window[ 'fetch' ]) {
      let request,
          headers,
          response;

      if (data) {
        headers = new Headers({
          'Content-Type': (
                            data instanceof FormData
                              ? 'application/x-www-form-urlencoded'
                              : 'application/json'
                          )
        });

        if (data instanceof FormData) {
          /**
           * check if any formData entry is a file and adjust the content type
           *
           * @see http://stackoverflow.com/a/35799817/2532203
           */
          for (let pair of data.entries()) {
            app.debug('processing form entry ' + pair[ 0 ] + ' with value ' + pair[ 1 ]);
            if (pair[ 1 ] instanceof File) {

              app.debug('form contains a binary file');
              headers.delete('Content-Type');
            }
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
    } else {
      let XHR = new XMLHttpRequest();

      XHR.open(method, url, true);

      if (data) {
        if (data.__proto__.constructor === FormData) {
          XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

          /**
           * check if any formData entry is a file and adjust the content type
           */
          for (let pair of data.entries()) {
            if (pair[ 1 ] instanceof File) {
              XHR.setRequestHeader('Content-Type', '');
            }
          }
        } else {
          XHR.setRequestHeader('Content-Type', 'application/json');
        }
      }

      XHR.onreadystatechange = function() {

        // when the data is available, fire the callback
        if (XHR.readyState === 4) {
          if (XHR.responseType === 'json') {
            XHR.responseJSON = JSON.parse(XHR.responseText);
          }

          if (XHR.status === 200 || XHR.status === 204) {
            XHR.ok = true;

            success.call(this, XHR);
          } else {
            XHR.ok = false;
            failure.call(this, XHR);
          }

          complete.call(this, XHR);
        }
      };

      for (let event in events) {
        if (events.hasOwnProperty('on' + event)) {
          XHR[ 'on' + event ] = events[ event ];
        }
      }

      XHR.send(data);
      return XHR;
    }
  };

  app.http.get = function(url, data, success, failure, events) {
    if (data) {
      if (typeof data === 'string') {
        const parsedData = {};
        data           = data.split('&');
        data.forEach(function(pair) {
          pair                    = pair.split('=');
          parsedData[ pair[ 0 ] ] = pair[ 1 ];
        });

        data = parsedData;
      }

      if (typeof data === 'object') {
        url = url + '?';

        const parameters = [];

        for (let i in data) {
          if (data.hasOwnProperty(i)) {
            parameters.push(i + '=' + data[ i ]);
          }
        }

        url = url + parameters.join('&');
      }

      if (typeof data === 'function') {
        success = data;
      }
    }

    app.debug('GET ' + url);
    return app.http.request('get', url, null, success, failure, events);
  };

  app.http.post = function(url, data, success, failure, events) {
    if (!data) {
      return false;
    }

    if (!data instanceof FormData) {
      const formData = new FormData();

      for (let key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }

        formData.append(key, data[ key ]);
      }

      data = formData;
    }

    /**
     * add the CSRF token to the data set
     */
    data.set('_csrf', document.body.dataset.csrfToken);

    app.debug('POST ' + url);
    return app.http.request('post', url, data, success, failure, events);
  };

  app.http.put = function(url, data, success, failure, events) {
    if (!data) {
      return false;
    }

    if (data instanceof FormData) {
      // ok
    } else {
      const formData = new FormData();

      for (let key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }

        formData.append(key, data[ key ]);
      }

      data = formData;
    }

    /**
     * add the CSRF token to the data set
     */
    data.set('_csrf', document.body.dataset.csrfToken);

    app.debug('PUT ' + url);
    return app.http.request('put', url, data, success, failure, events);
  };
};
