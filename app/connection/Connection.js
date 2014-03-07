define(['jsonp'], function (JSONP) {
    "use strict";
    /**
     * This object is for the Apigee connection. It will provide
     * CRUD calls for the resources required 
     */
    var Connection = function () {};

    Connection.prototype = {
        create : function (uri, urlParams, headerParams, body) {
            return this.request(uri, 'POST', urlParams, headerParams, body);
        },

        retrieve : function (uri, urlParams, headerParams, body) {
            return this.request(uri, 'GET', urlParams, headerParams, body);
        },

        update : function (uri, urlParams, headerParams) {
            return this.request(uri, 'PUT', urlParams, headerParams);
        },

        remove : function (uri, urlParams, headerParams) {
            return this.request(uri, 'DELETE', urlParams, headerParams);
        },

        submitForm : function (uri, fields, headers) {
            headers = headers || {};
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            return this.request(uri, "POST", {}, headers, fields);
        },

        // TODO rename this method to reflect that it does json p
        request : function (uri, method, urlParams) {
            method = (method == null) ? 'get' : method.toLowerCase();

            // ignores headerParams
            if (urlParams != null) {
                uri += '?callback=callback&format=json&method=' + method;

                for (var param in urlParams) {
                    if (urlParams.hasOwnProperty(param)) {
                        uri += '&' + param + '=' + urlParams[param];
                    }
                }
            }
            return JSONP.getJSON(uri);
        }
    };
    return Connection;
});