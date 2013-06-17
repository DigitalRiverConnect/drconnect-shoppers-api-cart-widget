define(['util/Class', 'service/BaseService', 'config', 'lib/q', 'util/util'], function(Class, BaseService, config, Q, utils) {
    var emptyOfferCache = null; // cache the empty offers.

    var CartService = BaseService.extend({
        init: function(client) {
            var self = this;
            self._super.apply(self, arguments);
            self.uri = config.getCartResourceUrl();
        },

        getActiveCart : function() {
            var self = this;
            return this.list(config.getCartResourceUrl(), {
                expand:'all,pricing.all,lineitems.lineitem.product,lineitems.lineitem.pricing.all,shippingOptions,shippingMethods'
            }).then(function(data) {
                return data.cart;
            });
        },

        getEmptyCartOffer : function() {
            var self = this;
            if (emptyOfferCache === null && config.getEmptyOfferUrl() != null) {
                defer = this.list(config.getEmptyOfferUrl(), {expand: 'productOffers.productOffer.addProductToCart'}).then(function(data) {
                    emptyOfferCache = data.offer;
                    return emptyOfferCache;
                }, function() {
                    // TODO Error handling.
                    defer = null;
                });
            } else {
                defer = Q(emptyOfferCache);
            }
            return defer;
        },

        applyCouponCode : function(v) {
            var self = this;
            if ($(self).triggerHandler('drconnect-beforeapplycode', [v]) !== false) {
                return self.post(null, {promoCode: v}).then(function(result){
                    return self.getActiveCart();
                }, function() {
                    // For now, we will never reach this
                    return self.getActiveCart();
                });
            }
        },

        addLineItemToCart : function(uri) {
            var self = this,
                pid = utils.getQueryStringParam(uri, 'productId'),
                productUri = [config.getProductResourceURL(), pid].join("/");

            if ($(self).triggerHandler('drconnect-beforeaddproduct', [uri]) !== false) {
                return self.list(productUri).then(function(p) {
                    if (p.product && p.product.variations && p.product.variations.product) {
                        $(self).trigger('drconnect-carterror', ["Base  products can't be purchased."]);
                        throw "Cannot add product to cart.";
                    }

                    return self.post(uri).then(function(lineitem) {
                        return self.getActiveCart();
                    }, function(e) {
                        $(self).trigger('drconnect-carterror', [e]);
                        throw e;
                    });
                }, function(err) {
                    $(self).trigger('drconnect-carterror', [err]);
                    throw err;
                });
            }
        },
        // Because we can't rely on  IE to get an error for this activity we need to manually 
        // check to see if this can succeed.
        // TODO When API Support is available, need to enable add product by quantity
        addLineItemToCartById : function(id, qty, originalLink){
            var self = this,
                uri = [config.getProductResourceURL(), id].join("/");

            qty = qty || 1;
            if ($(self).triggerHandler('drconnect-beforeaddproduct', [uri]) !== false) {
                return self.list(uri).then(function(p) {
                    // if the product has variations, we can't purchase, throw an error.
                    if (p.product && p.product.variations && p.product.variations.product) {
                        return Q(originalLink);
                    }

                    return self.post(config.getLineItemUrl(), {productId: id, quantity: qty}).then(function(lineitem) {
                        return self.getActiveCart();
                    }, function(e) {
                        e.message = "Unable to Add Item to cart";
                        $(self).trigger('drconnect-carterror', [e]);
                        throw e;
                    });
                }, function(err) {
                    err.message = "Unable to Add Item to cart";
                    $(self).trigger('drconnect-carterror', [err]);
                    throw err;
                });
            }
        },

        updateQuantity : function(lineItemId, qty) {
            var self = this,
                uri = [config.getCartResourceUrl(), "line-items", lineItemId].join("/");

            // wrap this in a function to allow a listener to cancel this
            if ($(self).triggerHandler('drconnect-beforequantityupdate', [qty, lineItemId]) !== false) {
                return self.post(uri, {
                    "quantity" : qty, expand: 'all'
                }).then(function(lineItem) {
                    $(self).trigger('drconnect-quantityupdate',[qty, lineItemId]);
                    return self.getActiveCart();
                }, function(err) {
                    $(self).trigger('drconnect-carterror', [err]);
                    throw err;
                });
            }
        },

        removeLineItem : function(lineItemId) {
            var self = this,
                uri = [config.getCartResourceUrl(), 'line-items', lineItemId].join("/");

            if ($(self).triggerHandler('drconnect-beforeremoveitem',[lineItemId]) !== false) {
                return self.remove(uri).then(function() {
                    return self.getActiveCart();
                }, function(errstr) {
                    // TODO Error handling, update feedback, etc.
                    return self.getActiveCart();
                });
            }
        },

        getWebCheckoutUrl: function() {
            return this._client.connect().then(function(access_token){
                return config.getWebCheckoutUrl() + '?token=' + access_token;
            }, function() {
                return "Unable to checkout";
            });
        },

        clearCache : function(){ 
            emptyOfferCache = null;
        }
    });
    return CartService;
});
