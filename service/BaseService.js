define(['util/Class', 'connection/Connection'], function(Class, Connection) {
    var BaseService = Class.extend({
        init: function(client) {
            var self = this;
            self._client = client;
            self._connection = new Connection();
        },

        list : function(uri, params) {
            var self = this;
            uri = uri || self.uri;

            return self._client.connect()
                .then(function(access_token) {
                    var urlParams = self._makeQueryParams({token: access_token}, params);
                    return self._connection.request(uri, 'GET', urlParams);
                });
        },

        get : function(id, params) {
            var self = this,
                uri = [self.uri, id].join("/");

            return self._client.connect()
                .then(function(access_token){
                    var urlParams = self._makeQueryParams({token: access_token}, params);
                    return self._connection.request(uri, 'GET', urlParams);
                });
        },

        post: function(uri, params) {
            var self = this;
            uri = uri || self.uri;

            return self._client.connect()
                .then(function(access_token) {
                    var urlParams = self._makeQueryParams({token: access_token}, params);
                    return self._connection.request(uri, 'POST', urlParams);
                });
        },

        remove : function(uri, params) {
            var self = this;
            uri = uri || self.uri;

            return self._client.connect()
                .then(function(access_token) {
                    var urlParams = self._makeQueryParams({token: access_token}, params);
                    return self._connection.request(uri, 'DELETE', urlParams);                    
                });
        },

        _makeQueryParams : function(o, params) {
            for (var p in params) {
                if (params.hasOwnProperty(p)) {
                    o[p] = params[p];
                }
            }
            return o;
        }
    });
    return BaseService;
});
