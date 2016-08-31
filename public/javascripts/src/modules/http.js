'use strict';

module.exports = function(app) {
  app.http = {

    /**
     * opens an HTTP request. uses the fetch API if available or falls back to XHR.
     *
     * @param {string}   method           the HTTP method
     * @param {string}   url              the request URL
     * @param {object}   [data]           a set of key-value pairs for GET requests or the body object
     * @param {function} [success]        a success callback
     * @param {function} [failure]        a failure callback
     * @param {object}   [events]         an object containing named events to attach to the request
     * @returns {XMLHttpRequest|Promise}  the request object. either a promise or the XHR
     */
    request: function(method, url, data, success, failure, events) {
      method  = method.toUpperCase();
      data    = data || undefined;
      success = success || function() {
        };
      failure = failure || function() {
        };
      events  = events || {};

      if (window[ 'fetch' ]) {
        return fetch(new Request(url, {
          method: method,
          body:   data
        })).then(function(response) {
          if (response.ok) {
            success.call(this, response);
          } else {
            failure.call(this, response);
          }

          return response;
        }, function(error) {
          failure.call(this, error);

          return error;
        });
      } else {
        var XHR = new XMLHttpRequest();
        XHR.open(method, url, true);

        XHR.onreadystatechange = function() {

          // when the data is available, fire the callback
          if (XHR.readyState == 4) {
            if (XHR.status == "200") {
              success.call(this, XHR);
            } else {
              failure.call(this, XHR);
            }
          }

        };

        for (var i in events) {
          if (events.hasOwnProperty(i)) {
            XHR[ i ] = events[ i ];
          }
        }

        XHR.send(data);
        return XHR;
      }
    }
  };
  
  app.get = function(url, data, success, failure, events) {
    if (data) {
      url = url + '?';

      var parameters = [];

      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          parameters.push(i + '=' + data[ i ]);
        }
      }

      url = url + parameters.join('&');
    }

    return app.http.request('get', url, null, success, failure, events);
  };

  app.post = function(url, data, success, failure, events) {
    if (data) {
      if (data instanceof FormData) {

      }
    }
    return app.http.request('post', data, success, failure, events);
  };
};
