/*
Copyright (C) 2014 Burak Son

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* jshint unused: true, laxcomma: true, freeze: true, strict: true */
(function (win, doc, xhr) {
  'use strict';

  var Molog = {

    /**
     * Sets the resolution units and initializes the framework.
     *
     * @return  void
     */
    init: function() {
      this.component();
      this.env();
      this.error();
      this.xhr();
    },

    /**
     * Sets the component from the "data-component" attribute of corresponding script tag.
     * NOTE: It will only find the attribute when the framework's source contains 'Molog' keyword.
     *
     * @return  void
     */
    component: function() {
      var s = doc.getElementsByTagName('script')
        , env;
      for( var i = 0, l = s.length; i < l; i++) {
        if (s[i].src.indexOf('molog') > -1) {
          env = s[i].getAttribute('data-component');
          break;
        }
      }
      this.component = env || '';
    },
    /**
     * Sets the env from the "data-env" attribute of corresponding script tag.
     * NOTE: It will only find the attribute when the framework's source contains 'Molog' keyword.
     *
     * @return  void
     */
    env: function() {
      var s = doc.getElementsByTagName('script')
        , env;
      for( var i = 0, l = s.length; i < l; i++) {
        if (s[i].src.indexOf('molog') > -1) {
          env = s[i].getAttribute('data-env');
          break;
        }
      }
      this.env = env || '';
    },

    /**
     * Listens for the error events, fires the pixel as soon as catches one.
     *
     * @return  void
     */
    error: function() {
      var _this = this;
      win.onerror = function (m, u, l, c, e) {
        // TODO: Stack trace param (e) will not work in old browsers.
        var s = e ? e.stack : null;
        _this.format([m,u,l,c,s], 0);
        _this.inject();
      };
    },

    /**
     * Fires custom tracking events.
     *
     * @return  void
     */
    event: function(data) {
      this.format(data, 1);
      this.inject();
    },

    /**
     * Fires xhr error event once request returns 4xx or 5xx response.
     *
     * @return  void
     */
    xhr: function() {
      var _self = this
        , _open = xhr.prototype.open
        , _send = xhr.prototype.send
        , _method, _url, _timestamp;

      xhr.prototype.open = function(method, url) {
        _timestamp = new Date();
        _method = method;
        _url = url;
        _open.apply(this, arguments);
      };

      xhr.prototype.send = function() {
        var self = this;
        var cb = function(response) {
          if (self.readyState == 4) {
            try {
              var res
                , status = response.target.status.toString()
                , timeSpan = new Date() - _timestamp
                , isError = /^[45]/.test(status.slice(0, -2));
              if (!isError) {
                return;
              }
              try {
                res = JSON.parse(response.target.response);
              } catch(e) {
                res = response.target.response.substring(0, 100);
              }
              _self.format([_method, status, res, _url, timeSpan], 2);
              _self.inject();
            } catch(e){}
          }
        };
        this.addEventListener('readystatechange', cb, false);
        _send.apply(this, arguments);
      };
    },


    /**
     * Formats data to be sent to server according to tracking type.
     *
     * @param   data          obj
     * @param   type          number
     * @return  void
     */
    format: function(data, type) {
      this.type = type;

      switch (this.type) {
        case 0:
          this.data = {
            message : data[0],
            source  : data[1],
            line    : data[2],
            column  : data[3],
            stack   : data[4]
          };
          break;

        case 1:
          this.data = (typeof data !== 'object') ? { _event : data } : data;
          break;

        case 2:
          this.data = {
            method        : data[0],
            status        : data[1],
            response      : data[2],
            url           : data[3],
            response_time : data[4]
          };
          break;
      }
    },

    /**
     * Returns the structured url with params.
     *
     * @return  string
     */
    url: function() {
      var params  = '&t=' + this.type + '&d=' +
                    encodeURIComponent(JSON.stringify(this.data)) +
                    '&cw=' + screen.width + '&ch=' + screen.height
      return (win.location.protocol+'//log.pho.im/' + this.component + '/' + this.env + '/?ts='+(new Date().getTime())+params);
    },

    /**
     * Injects the pixel into DOM.
     *
     * @return  void
     */
    inject: function() {
      var img = document.createElement('img');
      img.style.visibility = 'hidden';
      img.src = this.url();
      doc.getElementsByTagName('body')[0].appendChild(img);
      img.parentNode.removeChild(img);
    }

  };

  var Public = {
    /**
     * Public method for event tracker,  sends callback when the process is done.
     *
     * @param   data          obj
     * @param   cb            function
     * @return  void
     */
    push: function (data, cb) {
      if (typeof data === 'undefined') {
        return;
      }
      try {
        Molog.event(data);
        // Uses the default context for this.
        // We don't have anything to expose to the user, so we don't pass `this` as the callback context
        cb.call(null);
      } catch(e) {}
    }
  };

  Molog.init();

  win.Molog = win.Molog || Public;

}(window, document, XMLHttpRequest));
