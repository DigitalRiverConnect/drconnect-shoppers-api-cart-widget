define([
    'util/Class',
    'service/BaseService',
    'config'
], function (Class, BaseService, config) {
    // private variable to store a shopper
    var theShopper = {
        currency: null,
        locale: null
    };

    return BaseService.extend({
        init: function () {
            var self = this;
            self._super.apply(this, arguments);
            self.uri = config.getShopperUrl();
        },
        // overrides the base method
        list : function () {
            var self = this;
            return self._super.apply(self, [self.uri, {expand: 'currency,locale'}]);
        },

        updateShopper : function (options) {
            var self = this,
                url = config.getShopperUrl();

            if (options == null) {
                options = {};
            }

            // fill in default values
            options.currency = options.currency || config.getDefaultCurrency();
            options.locale = options.locale || config.getDefaultLocale();

            return self.post(url, options).then(function (result) {
                if (result.success) {
                    theShopper.currency = options.currency;
                    theShopper.locale = options.locale;
                }
                return theShopper;
            });
        }
    });
});
