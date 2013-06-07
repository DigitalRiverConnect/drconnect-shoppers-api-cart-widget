/*jslint browser: true, devel: false, nomen: true, sloppy: true, todo: true, indent: 4 */
/* Removing "use strict" but strict practices still apply */
define([
        'api/Client',
        'config',
        'service/Cart',
        'view/CartView',
        'util/Class'
    ], function(Client, config, Cart, CartView, Class) {

    // TODO this should be a configuration option
    var anchorSelector = 'a[href*="AddItemToRequisition"],area[href*="AddItemToRequisition"],a[href*="/store/"][href*="/buy/"][href*="/productID."],area[href*="/store/"][href*="/buy/"][href*="/productID."]';

    // Re-write standard store buy links to change them to add-to-cart
    // config option hijackLinks (default true).
    function ajaxifyAddToCartLinks(cartView, cartService, context) {
        // Define the regular expression searches for the hyperlinks
        var productIdRegEx = /\/?ProductID[=\.](\d+)\/?/i,
            quantityRegEx = /\/?Quantity[=\.](\d+)\/?/i;

        if (context === undefined) {
            context = document;
        }

        // Check for add-to-cart links, anywhere on the page
        $(anchorSelector, context).each(function() {
            // Assume that the productID HAS to be in an add-to-cart link!
            var productId = this.href.match(productIdRegEx)[1],
                quantity = (quantityRegEx.test(this.href)) ? RegExp.$1 : '1';

            // Add the onclick event-handler
            $(this).on("click", function(evt) {
                var $btn = $(this);
                evt.preventDefault();

                $btn.addClass('disabled');
                cartService.addLineItemToCartById(productId, quantity, $btn.attr('href')).then(function(cartData) {
                    if (typeof cartData === "string") {
                        // we returned a url; follow it.
                        window.location.href = cartData;
                    } else {
                        cartView.setCartQuantity(cartData.totalItemsInCart);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                        $btn.removeClass('disabled');
                        cartView.showFeedback("Item added to cart.");
                    }
                }, function(err) {
                    $btn.removeClass('disabled');
                    cartView.showFeedback(err.message, true);
                });
            });
        });
    }

    return Class.extend({
        defaults: {
            summaryElement: 'drMiniCartSummary',
            cartElement: 'drMiniCart',
            rewriteLinks: true
        },

        init: function(options) {
            var self = this, cartService, cartView, o;
            // set the options and then get them right away. Defaults will be set.
            self.setOptions(options);
            o = self.getOptions();

            // TODO check to make sure that API key exists
            self.client = new Client(options.apiKey);

            // TODO make sure that client is constructed properly
            cartService = new Cart(self.client);
            cartView = new CartView(options);

            // re-write all of the buy now links.
            if (o.rewriteLinks !== false) {
                ajaxifyAddToCartLinks.call(self, cartView, cartService);
            }

            $(cartService).on('drconnect-beforeaddproduct drconnect-beforeremoveitem drconnect-beforequantityupdate drconnect-beforeapplycode', function() {
                cartView.blockCartUI();
            }).on('drconnect-carterror', function() {
                cartView.unblockCartUI();
            });

            // listeners for cart events.
            $(cartView).on('drconnect-addtocart', function(evt, btn) {
                // if the item cannot be added to the cart, follow the link
                cartService.addLineItemToCart(btn.value).then(function(cartData) {
                    cartView.showFeedback("Item added to cart.");
                    cartView.setCartQuantity(cartData.totalItemsInCart);
                    cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                }, function(err) {
                    cartView.showFeedback(err.message, true);
                });
            }).on('drconnect-updatequantity', function(evt, qty, field) {
                var lineItemId = $(field).attr('data-lineitem-id');
                // check that the qty != field.defaultValue
                // if qty === defaultValue it is no-op.
                if (qty !== field.defaultValue) {
                    // a quantity update
                    // make sure that the qty can be parsed as a number
                    if (!isNaN(qty - 0) && (qty -0) > 0){
                        if (lineItemId) {
                            cartService.updateQuantity(lineItemId, qty).then(function(cartData) {
                                cartView.showFeedback("Quantity Updated");
                                cartView.setCartQuantity(cartData.totalItemsInCart);
                                cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                            }, function(err) {
                                cartView.showFeedback("Unable to Update", true);
                                field.value = field.defaultValue;
                            });
                        }
                    } else {
                        cartView.showFeedback("Please enter a number greater than zero", true);
                        field.value = field.defaultValue;
                    }
                }
            }).on('drconnect-remove', function(evt, icon) {
                var lineItemId = $(icon).attr('data-lineitem-id');
                if (lineItemId) {
                    cartService.removeLineItem(lineItemId).then(function(cartData) {
                        cartView.showFeedback("Item removed");
                        cartView.setCartQuantity(cartData.totalItemsInCart);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    });
                }
            }).on('drconnect-updatecart', function(evt, cartData) {
                this.unblockCartUI();
            }).on('drconnect-changecurrency', function(evt, c) {
                this.blockCartUI();
                self.client.updateShopper({currency: c}).then(function() {
                    // this returns 201 with no content
                    cartView.showFeedback("Currency Settings Updated");
                    return; // TODO maybe message shopper or log 
                }, function() {
                    cartView.showFeedback("Unable to update Currenct Settings", true);
                    return; // TODO maybe message shopper or log error
                }).done(function() {
                    cartService.clearCache();
                    cartService.getActiveCart().then(function(cartData) {
                        cartView.setCartQuantity(cartData.totalItemsInCart);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    });
                });
            }).on('drconnect-applycoupon', function(evt, field, btn) {
                var v = $(field).val();
                if (v != null) {
                    cartService.applyCouponCode(v).then(function(cartData) {
                        cartView.showFeedback("Coupon code applied. Final price will be determined at checkout.");
                        $(field).val("");
                        cartView.setCartQuantity(cartData.totalItemsInCart);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                        cartView.hideCouponEntry();
                    });
                }
            });

            $('.connect-cart-checkout').on('click', function() {
                cartService.getWebCheckoutUrl().then(function(url) {
                    window.location = url;
                });
            });

            this.start(cartView, cartService);
        },

        start : function(cartView, cartService) {
            var self = this;
            cartView.blockCartUI();
            cartService.getActiveCart().then(function(cartData) {
                if (cartData.pricing && cartData.pricing.orderTotal) {
                    cartView.setCartQuantity(cartData.totalItemsInCart);
                    cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    cartView.setCurrency(cartData.pricing.orderTotal.currency);
                } else {
                    self.client.shopperService.list().then(function(shopper) {
                        if (shopper.currency) {
                            cartView.setCartQuantity(cartData.totalItemsInCart);
                            cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                            cartView.setCurrency(shopper.currency);
                        } else {
                            cartView.setCurrency(config.getDefaultCurrency());
                            self.client.updateShopper({
                                currency: config.getDefaultCurrency(),
                                locale: config.getDefaultLocale()
                            }).then(function(s) {
                                cartView.setCartQuantity(cartData.totalItemsInCart);
                                cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                            });
                        }
                    });
                }
            });
        },

        setOptions : function(o) {
            var self = this;
            self.options = $.extend({}, o);
            // write back several constructor args to the cofig object
            if (self.options.emptyOfferId) {
                config.setEmptyOfferId(self.options.emptyOfferId);
            }
        },

        getOptions : function() {
            return this.options;
        },

        setOption : function(k, v) {
            this.options[k] = v;
        },

        getOption : function(k) {
            return this.options[k];
        }
    });
});