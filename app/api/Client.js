define(['util/Class', 'connection/Session', 'service/Shopper'], function (Class, Session, ShopperService) {
    return Class.extend({
        // the constructor function
        init: function (apiKey) {
            var self = this;
            self._session = new Session(apiKey);
            self.shopperService = new ShopperService(self);
        },

        connect: function () {
            var self = this,
                s = self._session;

            $(self).trigger('drconnect-beforeconnect', [self]);
            return s.getAccess();
        },

        disconnect : function () {
            this._session.reset();
        },

        getSession : function () {
            return this._session;
        },
        // convenience method; passes through to the shopper service
        updateShopper : function (options) {
            var self = this;
            return this.shopperService.updateShopper(options).then(function (shopper) {
                self._session.updateShopperSession(shopper);
                return shopper;
            }, function (err) {
                throw err;
            });
        }
    });
});
