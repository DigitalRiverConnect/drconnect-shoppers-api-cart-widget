define([], function() {
    // create a private connection object
    var config = {
        env: 'prod',
        connection : {},
        emptyOfferPop: 'SiteMerchandising_EmptyCart',
        defaultCurrency: 'USD',
        defaultLocale: 'en_US'
    };

    // store connection information for various environments
    // never a trailing slash
    config.connection.URI = {
        BASE_URL: null,
        DEV_BASE_URL: 'http://23.21.197.49',
        SYS_BASE_URL: 'http://23.21.197.49:2080',
        PRD_BASE_URL: 'https://api.digitalriver.com',
        CTE_BASE_URL: 'https://api-cte.digitalriver.com',
        VERSION: 'v1',
        ANONYMOUS_LOGIN: 'shoppers/token',
        CATEGORY_RESOURCE : 'shoppers/me/categories',
        CART_RESOURCE : 'shoppers/me/carts/active',
        OFFER_RESOURCE: 'shoppers/me/point-of-promotions',
        WEB_CHECKOUT : 'shoppers/me/carts/active/web-checkout',
        SHOPPER: 'shoppers/me',
        HOME_PAGE_OFFER : 'shoppers/me/point-of-promotions',
        LINE_ITEM_RESOURCE: 'shoppers/me/carts/active/line-items',
        PRODUCT_RESOURCE: 'shoppers/me/products'
    };

    // return a public interface
    return {
        getBaseUrl: function() {
            var self = this,
                c = config.connection.URI,
                uri;

            switch (self.getEnv()) {
            case 'dev':
                uri = c.DEV_BASE_URL;
                break;
            case 'sys':
                uri = c.SYS_BASE_URL;
                break;
            case 'cte':
                uri = c.CTE_BASE_URL;
                break;
            case 'prod':
                // the default.. fall through
            default:
                uri =  c.PRD_BASE_URL;
                break;
            }
            return uri;
        },

        getHomePageOfferUrl: function() {
            var self = this, c = config.connection.URI;

            return [
                self.getBaseUrl(),
                c.VERSION,
                c.OFFER_RESOURCE,
                config.homePagePop,
                "offers",
                config.homePageOfferId,
                "product-offers"].join("/");
        },

        getAnonymousLoginUri: function() {
            var self = this, c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.ANONYMOUS_LOGIN].join("/");
        },

        getTokenServiceUri : function() {
            return "https://store.digitalriver.com/store?Action=ShopDomain&Locale=en_US&SiteId=cpryce&Env=DESIGN";
        },

        getCategoryResourceUrl : function() {
            var self  = this, c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.CATEGORY_RESOURCE].join("/");
        },

        getCartResourceUrl: function() {
            var self = this, c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.CART_RESOURCE].join("/");
        },

        getWebCheckoutUrl : function() {
            var self = this, c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.WEB_CHECKOUT].join("/");
        },

        getEmptyOfferUrl : function() {
            var self = this, c = config.connection.URI;

            if (config.emptyOfferPop != null && config.emptyOfferId != null) {
                return [
                    self.getBaseUrl(),
                    c.VERSION,
                    c.OFFER_RESOURCE,
                    config.emptyOfferPop,
                    "offers",
                    config.emptyOfferId].join("/");
            }
        },

        getLineItemUrl: function() {
            var self = this, c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.LINE_ITEM_RESOURCE].join("/");
        },

        getProductResourceURL: function() {
            var self = this, c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.PRODUCT_RESOURCE].join("/");
        },

        getShopperUrl: function () {
            var self = this,  c = config.connection.URI;
            return [self.getBaseUrl(), c.VERSION, c.SHOPPER].join("/");
        },

        getEnv: function() {
            return config.env;
        },

        setEnv: function(v) {
            config.env = v;
        },

        getApiKey : function() {
            return config.apiKey;
        },

        setApiKey : function(k) {
            config.apiKey = k;
        },

        getDefaultCurrency : function() {
            return config.defaultCurrency;
        },

        setDefaultCurrency : function(c) {
            config.defaultCurrency = c;
        },

        getDefaultLocale : function() {
            return config.defaultLocale;
        },

        setDefaultLocale : function(l) {
            config.defaultLocale = l;
        },

        getEmptyOfferId : function() {
            return config.emptyOfferId;
        },

        setEmptyOfferId : function(id) {
            config.emptyOfferId = id;
        },

        getEmptyOfferPop : function() {
            return config.emptyOfferPop;
        },

        setEmptyOfferPop : function(popName) {
            config.emptyOfferPop = popName;
        }
    };
});
