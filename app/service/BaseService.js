define([
    'util/Class',
    'connection/Connection'
], function (Class, Connection) {
    return Class.extend({
        init: function (client) {
            var self = this;
            self._client = client;
            self._connection = new Connection();
        },

        list : function (uri, params, cache) {
            var self = this;
            uri = uri || self.uri;

            return self._client.connect()
                .then(function (accessToken) {
                    var urlParams = self._makeQueryParams({token: accessToken}, params);
                    return self._connection.request(uri, 'GET', urlParams, cache);
                });
        },

        get : function (id, params, cache) {
            var self = this,
                uri = [self.uri, id].join("/");

            return self._client.connect()
                .then(function (accessToken) {
                    var urlParams = self._makeQueryParams({token: accessToken}, params);
                    return self._connection.request(uri, 'GET', urlParams, cache);
                });
        },

        post: function (uri, params) {
            var self = this;
            uri = uri || self.uri;

            return self._client.connect()
                .then(function (accessToken) {
                    var urlParams = self._makeQueryParams({token: accessToken}, params);
                    return self._connection.request(uri, 'POST', urlParams);
                });
        },

        remove : function (uri, params) {
            var self = this;
            uri = uri || self.uri;

            return self._client.connect()
                .then(function (accessToken) {
                    var urlParams = self._makeQueryParams({token: accessToken}, params);
                    return self._connection.request(uri, 'DELETE', urlParams);
                });
        },

        _makeQueryParams : function (o, params) {
            for (var p in params) {
                if (params.hasOwnProperty(p)) {
                    o[p] = params[p];
                }
            }
            return o;
        }
    });
});
