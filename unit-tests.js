/*jslint browser: true, devel: true, eqeq: true, nomen: true */
/* globals define require requirejs module start stop ok equal test asyncTest notEqual $ */

/**
 * Constants for testing 
 */

var TEST_VALUES = {
    VALID_PRODUCT_ID: '279217700',
    API_KEY: '69ae4fa2eb7bc4dc5057d4b17356c8ca',
    LOCALE: 'en_US',
    DEFAULT_CURRENCY: "USD",
    CURRENCY: 'GBP',
    CART_ID: "",
    COUPON_CODE: '6rhmg3whq'
};

requirejs.config({
    baseUrl : './',
    shim : {
        "lib/underscore" : {
            exports : '_'
        }
    },
    paths : {
        lib : 'lib',
        underscore: 'lib/underscore'
    }
});

requirejs([
    'api/Client',
    'config',
    'util/Class',
    'service/Cart',
    'service/Shopper',
    'lib/underscore',
    'util/util'
], function(Client, config, Class, Cart, Shopper, _, util) {

    "use strict";

    // Make sure that we are testing prod
    config.setEnv('prod');

    // set the api here so that all tests have access
    config.setApiKey(TEST_VALUES.API_KEY);

    // see if we are testing for an existing cart
    TEST_VALUES.CART_ID = util.getQueryStringParam(window.location, "reference") || "";

    /**
     * MODULE 1
     * Test to make sure that requirejs support is enabled.
     */
    module('require');
    /**
     * TEST 1
     * Duck-type testing to see if define and require are defined as global funcitons, and 
     * define.amd exists.
     */
    test("require support", function() {
        ok((typeof require === "function"), "global require is function");
        ok((typeof define === "function" && define.amd), "define is a function and defines define.amd");
    });

    /**
     * MODULE 2 : Config
     * Test to make sure that requirejs support is enabled.
     */
    module('config');
    /**
     * TEST 2
     * Test to make sure that config supports the documented public functions
     * Test to make sure that getters and setters return the correct values
     */
    test("config method support", 29, function() {
        ok($.isFunction(config.getBaseUrl), "getBaseUrl exists");
        ok($.isFunction(config.getHomePageOfferUrl), "getHomePageOfferUrl exists");
        ok($.isFunction(config.getAnonymousLoginUri), "getAnonymousLoginUri exists");
        ok($.isFunction(config.getTokenServiceUri), "getTokenServiceUri exists");
        ok($.isFunction(config.getCategoryResourceUrl), "getAnonymousLoginUri exists");
        ok($.isFunction(config.getCartResourceUrl), "getCategoryResourceUrl exists");
        ok($.isFunction(config.getWebCheckoutUrl), "getWebCheckoutUrl exists");
        ok($.isFunction(config.getEmptyOfferUrl), "getEmptyOfferUrl exists");
        ok($.isFunction(config.getLineItemUrl), "getLineItemUrl exists");
        ok($.isFunction(config.getProductResourceURL), "getProductResourceURL exists");
        ok($.isFunction(config.getShopperUrl), "getShopperUrl exists");

        ok($.isFunction(config.getEnv), "getEnv exists");
        ok($.isFunction(config.setEnv), "setEnv exists");

        config.setEnv('dev');
        equal('dev', config.getEnv(), "able to set env config options");
        config.setEnv('prod');
        equal('prod', config.getEnv(), "able to set env config options");

        ok($.isFunction(config.getApiKey), "getApiKey exists");
        ok($.isFunction(config.setApiKey), "setApiKey exists");

        config.setApiKey("foo");
        equal('foo', config.getApiKey(), "able to set api key");
        config.setApiKey(TEST_VALUES.API_KEY);
        equal(TEST_VALUES.API_KEY, config.getApiKey(), "key value reset.");

        ok($.isFunction(config.getDefaultCurrency), "getDefaultCurrency exists");
        ok($.isFunction(config.setDefaultCurrency), "setDefaultCurrency exists");

        config.setDefaultCurrency('GBP');
        equal('GBP', config.getDefaultCurrency(), "setDefaultCurrency succeeds");
        config.setDefaultCurrency(TEST_VALUES.DEFAULT_CURRENCY);
        equal(TEST_VALUES.DEFAULT_CURRENCY, config.getDefaultCurrency(), "default currency reset.");

        ok($.isFunction(config.getDefaultLocale), "getDefaultLocale exists");
        ok($.isFunction(config.setDefaultLocale), "setDefaultLocale exists");
        ok($.isFunction(config.getEmptyOfferId), "getEmptyOfferId exists");
        ok($.isFunction(config.setEmptyOfferId), "setEmptyOfferId exists");
        ok($.isFunction(config.getEmptyOfferPop), "getEmptyOfferPop exists");
        ok($.isFunction(config.setEmptyOfferPop), "setEmptyOfferPop exists");
    });
    /**
     * Module 2 
     */
    module('client');
    /**
     * TEST 3
     * Test to see if Client exists and supports connect and disconnect.
     * Test to see if connect returns an access token, and the token matches 
     * a know regex.
     * 
     * Test to see if multiple calls to connect return the same token.
     */
    asyncTest("api/Client Tests", 7, function() {
        // instantiate a new client. Test the instantiated object.
        var self = this,
            client = new Client(config.getApiKey());

        // test to make sure that documented public methods are supported
        ok(client instanceof Class, "client inherits from Class");  // properly inherits
        ok(typeof client.connect === "function", "client supports connect method");
        ok(typeof client.disconnect === "function", "client supports discount method");
        ok(typeof client.updateShopper === "function", "client supports updateShopper method");

        // test the connect method. should be a better metter to test if connect returns a promise.
        client.connect()
            .then(function(access_token) {
                // test the token returned from connect
                ok(typeof access_token === 'string', "Client.connect returns string");
                ok(access_token.match(/^[a-z0-9]+$/i), "matches regular expression /^[a-z0-9]+$/i");

                // store it to test against the second call to connect.
                self._token = access_token;

                // make a second call which should return the same token
                // chains the promise which will fall through to the done function
                return client.connect();
            }, function(errstr) {
                // Reaching the error handler is a failed test
                ok(false, "Failed getting access token " + errstr);
                start();
            }).done(function(access_token) {
                // return value here is from the second call to connect. Test the 
                // return against the store value from the first call to connect.
                equal(self._token, access_token, "successive calls to connect give the same token.");
                start();
            });
    });

    /** 
     * TEST 4
     * Test the disconnect method.
     * After calling disconnect() and re-connecting, we should get a different token
     */
    asyncTest("api/Client Tests", 5, function() {
        var self = this,
            client = new Client(config.getApiKey());

        client.connect()
            .then(function(access_token) {
                ok(typeof access_token === 'string', "Client.connect returns string");
                ok(access_token.match(/^[a-z0-9]+$/i), "matches regular expression /^[a-z0-9]+$/i");
                self._token = access_token;
                // disconnect to clear the token
                client.disconnect();
            }, function(errstr) {
                ok(false, "error getting access. " + errstr);
            }).done(function() {
                start();
            });

        stop();
        // make another call to connect
        setTimeout(function() {
            client.connect().then(function(access_token) {
                ok(typeof access_token === 'string', "Client.connect returns string");
                ok(access_token.match(/^[a-z0-9]+$/i), "matches regular expression /^[a-z0-9]+$/i");
                notEqual(self._token, access_token);
            }, function(errstr) {
                ok(false, "error getting cart. " + errstr);
            }).done(function() {
                start();
            });
        }, 2000);
    });

    /*
     * MODULE 3
     * Set up a client for each of the tests to access
     */
    module('service', {
        setup: function() {
            this._client = new Client(config.getApiKey());
            this.at = null;
            this._cartid = TEST_VALUES.CART_ID || null;
        }
    });
    /**
     * TEST 5
     * Test the Cart service.
     * Test the supported methods.
     * Test the getActiveCart method returns the existing cart if it was established.
     * Test that getActiveCart returns the correct object
     */
    asyncTest("Cart.getCart Tests", 11, function() {
        var self = this,
            cartService = new Cart(this._client);

        ok(cartService instanceof Class, "cart extends Class");
        ok($.isFunction(cartService.post), "cart provides inherited post method");
        ok($.isFunction(cartService.list), "cart provides inherited list method");
        ok($.isFunction(cartService.getActiveCart), "cart provides getActive method");
        ok($.isFunction(cartService.addLineItemToCart), "cart provides addLineItemToCart method");
        ok($.isFunction(cartService.updateQuantity), "cart provides updateQuantity method");
        ok($.isFunction(cartService.removeLineItem), "cart provides removeLineItem method");
        ok($.isFunction(cartService.getWebCheckoutUrl), "cart provides getWebCheckoutUrl method");

        cartService.getActiveCart().then(function(cartData) {
            if (self.at === null) {
                self.at = self._client.getSession().getAccessToken();
                equal(self.at, self._client.getSession().getAccessToken(), "stored access token is the same");
            }
            ok((cartData.relation === "http://developers.digitalriver.com/v1/shoppers/CartsResource"), "cart resource returns correct JSON");

            if (self._cartid == null) {
                self._cartid = cartData.id;
            }
            equal(cartData.id, self._cartid, "Expecting cartid: " + self._cartid);

        }, function(errstr) {
            // executes when an error getting the cart is thrown.
            ok(false, "error getting cart. " + errstr);
        }).done(function() {
            start();
        });
    });
    /**
     * TEST 6
     * Test the post method of the CartServie by posting to the Line-Items resource
     */
    asyncTest("Cart.post Test", 2, function() {
        var self = this,
            cartService = new Cart(this._client),
            url = config.getCartResourceUrl() + '/line-items?' + 'productId=' + TEST_VALUES.VALID_PRODUCT_ID;

        cartService.post(url).then(function(lineItem) {
            if (self.at === null) {
                self.at = self._client.getSession().getAccessToken();
                equal(self.at, self._client.getSession().getAccessToken(), "stored access token is the same");
            }

            ok(lineItem.success, "add line item returns success");
        }, function(errstr) {
            ok(false, "error getting line item " + errstr);
        }).done(function() {
            start();
        });
    });
    /**
     * TEST 7
     * Test the add/removeLineItemToCart 
     */
    asyncTest("Cart.add_removeLineItem Tests", 5, function() {
        var self = this,
            cartService = new Cart(this._client),
            lineItemId,
            url = config.getCartResourceUrl() + '/line-items?' + 'productId=' + TEST_VALUES.VALID_PRODUCT_ID;

        cartService.addLineItemToCart(url).then(function(cartData) {
            if (self.at === null) {
                self.at = self._client.getSession().getAccessToken();
                equal(self.at, self._client.getSession().getAccessToken(), "stored access token is the same");
            }

            if (self._cartid == null) {
                self._cartid = cartData.id;
            }

            ok((cartData.relation === "http://developers.digitalriver.com/v1/shoppers/CartsResource"), "addLineItems returns getCart");
            equal(cartData.id, self._cartid, "Expected cartid: " + self._cartid);

            stop();
            if (cartData.lineItems.lineItem.length) {
                lineItemId = cartData.lineItems.lineItem[0].id;
                cartService.removeLineItem(lineItemId).then(function(cd) {
                    ok((cd.relation === "http://developers.digitalriver.com/v1/shoppers/CartsResource"), "removeLineItem returns getCart");
                    // check to make sure that lineItemId is not in the cart.
                    ok(!_.find(cd.lineItems.lineItem, function(li) {
                        return li.id === lineItemId;
                    }), "Line Item is removed");
                }).done(function() {
                    start();
                });
            } else {
                ok(false, "Add Line Item To cart failed");
            }
        }, function(errstr) {
            ok(false, "error getting line item " + errstr);
        }).done(function() {
            start();
        });
    });
    /**
     * TEST 8
     * Test update shopper then get a shopper 
     */
    asyncTest("Shopper.updateShopper", 5, function() {
        var self = this,
            shopperService = new Shopper(this._client);

        shopperService.updateShopper({currency: TEST_VALUES.CURRENCY, locale: TEST_VALUES.LOCALE}).then(function(shopper) {
            if (self.at === null) {
                self.at = self._client.getSession().getAccessToken();
                equal(self.at, self._client.getSession().getAccessToken(), "stored access token is the same");
            }
            equal(shopper.currency, TEST_VALUES.CURRENCY, "updateShopper returns correct currency");
            equal(shopper.locale, TEST_VALUES.LOCALE, "Shopper returns the correct locale");

            // now get a cart to verify pricing has updated.
            stop();
            shopperService.list().then(function(shopperData) {
                equal(shopperData.shopper.currency, TEST_VALUES.CURRENCY, "Currency was updated.");
                equal(shopperData.shopper.locale, TEST_VALUES.LOCALE, "Locale was updated.");
            }).done(function() {
                start();
            });
        }, function(errstr) {
            ok(false, "error getting line item " + errstr);
        }).done(function() {
            start();
        });
    });
    /**
     * TEST 9
     * Test update shopper then get a cart. 
     */
    asyncTest("Shopper.updateShopper", 3, function() {
        var self = this,
            cartService = new Cart(this._client),
            shopperService = new Shopper(this._client);

        shopperService.updateShopper({currency: TEST_VALUES.CURRENCY, locale: TEST_VALUES.LOCALE}).then(function(shopper) {
            if (self.at === null) {
                self.at = self._client.getSession().getAccessToken();
                equal(self.at, self._client.getSession().getAccessToken(), "stored access token is the same");
            }
            ok(shopper.currency && shopper.locale, "updateShopper returns shopper");
            // now get a cart to verify pricing has updated.
            stop();
            var url = config.getCartResourceUrl() + '/line-items?' + 'productId=' + TEST_VALUES.VALID_PRODUCT_ID;
            cartService.addLineItemToCart(url).then(function(cartData) {
                equal(cartData.pricing.orderTotal.currency, TEST_VALUES.CURRENCY, "Cart Currency was updated.");
            }).done(function() {
                start();
            });
        }, function(errstr) {
            ok(false, "error getting line item " + errstr);
        }).done(function() {
            start();
        });
    });
    /**
     * TEST 10
     * Test the post method of the CartServie by posting to the Line-Items resource
     */
    asyncTest("Cart.applyCoupon Test", 4, function() {
        var self = this,
            cartService = new Cart(this._client),
            url = config.getCartResourceUrl() + '/line-items?' + 'productId=' + TEST_VALUES.VALID_PRODUCT_ID;

        cartService.addLineItemToCart(url).then(function(cartData) {
            if (self.at === null) {
                self.at = self._client.getSession().getAccessToken();
                equal(self.at, self._client.getSession().getAccessToken(), "stored access token is the same");
            }

            if (self._cartid == null) {
                self._cartid = cartData.id;
            }
            ok((cartData.relation === "http://developers.digitalriver.com/v1/shoppers/CartsResource"), "addLineItems returns getCart");
            equal(self._cartid, cartData.id, "got the same cartid: " + cartData.id);

            stop();
            cartService.applyCouponCode(TEST_VALUES.COUPON_CODE).then(function(c) {
                ok((c.relation === "http://developers.digitalriver.com/v1/shoppers/CartsResource"), "applyCoupon returns getCart");
            }).done(function() {
                start();
            });
        }, function(errstr) {
            ok(false, "error getting line item " + errstr);
        }).done(function() {
            start();
        });
    });
});
