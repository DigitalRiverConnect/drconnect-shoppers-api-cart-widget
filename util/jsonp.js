/**
 * An API Library for making JSON P calls without jQuery.
 * @author Christopher Pryce<cpryce@digitalriver.com>
 * 
 * Based on JSON and JSONP By Angus Croll
 * http://javascriptweblog.wordpress.com/2010/11/29/json-and-jsonp/
 * 
 * Copyright 2013 Digital River, Inc.
 *
 * Module definition
 * @dependency Q or an other library that supports CommonJS Promises/A API
 * @dependency underscore The underscore library, or another library that provides
 * a shim to map and forEach for supporting browsers still using ECMA 3.
 * 
 * jslint browser: true, nomen: true, sloppy: true 
 * using sloppy here for performance, but strict practices apply
 * 
 */
define(['lib/q', 'lib/underscore', 'lib/json2'], function(promisesLib, _, JSON) {
    var jsonp, JsonpError = function(name, message, options) {
        this.name = name;
        this.message = message;
        this.value = options;
        this.toString = function() {
            return this.name + ": " + this.message + " " + options.join(",");
        };
    };

    jsonp = {
        // to provide unique callback identifiers
        callbackCounter: 0,

        /**
         * GETS JSON string from a remote URL
         * @param {String} uri The url of the call
         * @param {String} method One of either post, get, put or delete. This is sent to 
         *      API server as a string value.
         * @param {Object} urlParams An object to be encoded on the URL 
         */
        getJSON: function(uri, method, urlParams) {
            var defer = promisesLib.defer(),
                self = this,
                fnName,
                qstringParams = [],
                scriptTag,
                script;

            // encode the URL parameters
            qstringParams = _.map(urlParams, function(v, k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(v);
            });

            // create a temporary global function with a incremental key.
            // keeps duplicate functions from being created. 
            fnName = 'JSONPCallback_' + self.callbackCounter;
            self.callbackCounter += 1;

            window[fnName] = self.evalJSONP(defer);

            qstringParams.push('callback=' + fnName);
            qstringParams.push('format=json');
            qstringParams.push('dt=' + new Date().getTime()); // cache busting for GET request

            if (method) {
                method = method.toLowerCase();
            }
            qstringParams.push('method=' + method || 'get');

            uri += (uri.indexOf('?') === -1) ? '?' + qstringParams.join('&') : '&' + qstringParams.join('&');

            // append a script element to the document.
            scriptTag = document.createElement('SCRIPT');
            scriptTag.src = uri;
            script = document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);

            // to handle scripts that return 201 or 204 and don't have a payload
            script.onload = script.onreadystatechange = function() {
                if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    // wait briefly then if the promise is still pending, fulfill it with a simple json payload
                    setTimeout(function() {
                        if (defer.promise.isPending() && window[fnName]) {
                            window[fnName]({"success" : true});
                        }
                    }, 10);
                    // for a memory leak in ie6
                    script.onload = script.onreadystatechange = null;
                }
            };

            script.onerror = function () {
                setTimeout(function() {
                    if (defer.promise.isPending() && window[fnName]) {
                        defer.reject(new JsonpError("Server Error", "", qstringParams));
                    }
                }, 10);
            };

            // clean up global function and remove script after the function runs.
            return defer.promise.then(function(data) {
                window[fnName] = undefined;
                try {
                    delete window[fnName];
                } catch (ignore) {
                    // ignore error
                }

                try {
                    script.parentNode.removeChild(script);
                } catch (ignore) {
                    // ignore error
                }

                // chain the promise
                return data;
            }, function(err) {
                window[fnName] = undefined;
                try {
                    delete window[fnName];
                } catch (ignore) {
                    // ignore error
                }

                try {
                    script.parentNode.removeChild(script);
                } catch (ignore) {
                    // ignore error
                }
                throw err;
            });
        },
        /**
         * Evaluates the JSON object returned from the getJSON call
         * Resolves the passed promise.
         * @param {Promise} defer A CommonJS Promise/A API promise Object
         */
        evalJSONP: function(promise) {
            // return a closure to run when the script is loaded
            return function(data) {
                var validJSON = false;
                if (typeof data === "string") {
                    try {
                        validJSON = JSON.parse(data);
                    } catch (ignore) {
                        // invalid JSON or JSON.parse is not supported.
                    }
                } else {
                    try {
                        validJSON = JSON.parse(JSON.stringify(data));
                    } catch (e) {
                        validJSON = data;
                    }
                }

                if (validJSON) {
                    promise.resolve(validJSON);
                } else {
                    promise.reject("JSONP call returned invalid or empty JSON");
                }
            };
        }
    };
    return jsonp;
});
