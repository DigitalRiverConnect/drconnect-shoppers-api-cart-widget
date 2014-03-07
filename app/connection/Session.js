/*jslint eqeq: true, nomen: true */
define(['config', 'connection/Connection', 'q'], function (config, Connection, Q) {
    /**
     * This object is for getting a Session for connecting
     * @returns {Session}
     */
    var Session = function (apikey) {
        var self = this;

        self.apiKey = apikey;
        self._connection = new Connection();
        self.reset();
    };

    Session.prototype = {
        getAccess: function (accessType) {
            if (!accessType || accessType !== "authenticated") {
                return this.getLimitedAccess();
            }
        },

        getLimitedAccess : function () {
            /*jshint newcap:false*/
            var self = this,
                accessToken = self.getAccessToken(),
                defer;

            // do we have an access token?
            if (accessToken) {
                // if yes, is it valid? 
                if (self.isTokenTimeStampValid()) {
                    // if yes wrap it in a promise and return it.
                    defer = Q(accessToken);
                } else {
                    // Get a new anonymous token using the shopper content element.
                    // Provides refresh.
                    defer = self.anonymousLogin();
                }
            } else {
                // if we do not have a token, return the promise to get one.
                defer = self.anonymousLogin();
            }

            return defer;
        },

        isTokenTimeStampValid : function () {
            var self = this,
                dt = new Date().getTime();

            return (self.tokenExpirationTime && self.tokenExpirationTime > dt);
        },
        // for now, since JSON P support for refresh token does not 
        // exist, get a new token
        doRefreshToken : function (promise) {
            return this.anonymousLogin(promise);
        },

        anonymousLogin: function (promise) {
            var self = this,
                d = new Date(),
                locale = self.getLocale(),
                siteId = config.getSiteId(),
                uri;

            uri = config.getTokenServiceUri(locale, siteId);
            uri += uri.indexOf('?') !== -1 ? "&callback=callback" : '?callback=callback';

            if (self.pendingRequest == null) {
                self.pendingRequest = self._connection.request(uri, 'GET').then(function (sessionData) {
                    var tokenOptions = {
                        "ts" : d.getTime(),
                        "apiKey" : self.apiKey
                    };
                    // if there is session cookies, use them. If not, use the shopDomain
                    if (sessionData.stickyParameters === null || sessionData.stickyParameters === "") {
                        tokenOptions.domain = sessionData.shopDomain;
                    } else {
                        tokenOptions.domain = sessionData.shopDomain;
                        tokenOptions.cookie = sessionData.stickyParameters;
                    }
                    return self.getAnnonymousAccessToken(tokenOptions);
                });
            }
            return self.pendingRequest;
        },

        getAnnonymousAccessToken : function (urlParams, promise) {
            var self = this,
                uri = config.getAnonymousLoginUri();
                debugger;
            return self._connection.request(uri, 'GET', urlParams)
                .then(function (data) {
                    /*jshint camelcase: false*/
                    self.connected = true;
                    self.setAccessToken(data.access_token);
                    self.setRefreshToken(data.refresh_token);
                    self.tokenStartTime = new Date().getTime();
                    self.tokenExpirationTime = new Date().getTime() + parseInt(data.expires_in * 1000, 10);

                    if (promise && typeof promise.resolve === 'function') {
                        promise.resolve(data.access_token);
                    }
                    self.pendingRequest = null;
                    return data.access_token;
                }).fail(function (errorStr) {
                    // If fails cleans the refresh_token to obtain a new one on the next anonymousLogin call
                    if (promise && typeof promise.reject === 'function') {
                        promise.reject(errorStr);
                    }
                    self.reset();
                    self.pendingRequest = null;
                });
        },
        updateShopperSession : function (shopper) {
            var self = this;
            if (shopper) {
                self._locale = shopper.Locale || config.getDefaultLocale();
            }
        },

        reset : function () {
            var self = this;
            self.setAccessToken(null);
            self.setRefreshToken(null);
            self.connected = false;
            self.tokenStartTime = null;
            self.tokenExpirationTime = null;
        },

        getAccessToken : function () {
            return this._token;
        },

        setAccessToken : function (t) {
            this._token = t;
        },

        getRefreshToken: function () {
            return this._refreshToken;
        },

        setRefreshToken: function (rt) {
            this._refreshToken = rt;
        },

        getClient : function () {
            return this._client;
        },

        getLocale : function () {
            return this._locale || config.getDefaultLocale();
        }
    };

    return Session;
});
