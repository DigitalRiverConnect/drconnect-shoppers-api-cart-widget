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
                        cartView.updateCartSummary(cartData);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                        $btn.removeClass('disabled');
                        cartView.showFeedback("Item added to cart");
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
            var self = this, cartService, cartView, o, $el;
            // set the options and then get them right away. Defaults will be set.
            self.setOptions(options);
            o = self.getOptions();

            // check to see if we passed in a constructed client or an apiKey
            if (o.client && o.client instanceof Client) {
                self.client = o.client;
            } else if (o.apiKey) {
                // TODO check to make sure that API key exists
                self.client = new Client(o.apiKey);
            }

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

            $el = cartView.getCartElement();
            // listeners for cart events.
            $(cartView).on('drconnect-addtocart', function(evt, btn) {
                // if the item cannot be added to the cart, follow the link
                cartService.addLineItemToCart(btn.value).then(function(cartData) {
                    cartView.showFeedback("Item added to cart.");
                    cartView.updateCartSummary(cartData);
                    cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    // TODO this should include a reference to the line item updated.
                    $el.trigger('drconnect-addtocart', [cartData]);
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
                            $el.trigger('drconnect-updatequantity', [lineItemId, qty, field]);
                            cartService.updateQuantity(lineItemId, qty).then(function(cartData) {
                                cartView.showFeedback("Quantity Updated");
                                cartView.updateCartSummary(cartData);
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
                        $el.trigger('drconnect-remove', [lineItemId]);
                        cartView.showFeedback("Item removed");
                        cartView.updateCartSummary(cartData);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    });
                }
            }).on('drconnect-updatecart', function(evt, cartData) {
                cartView.unblockCartUI();
                $el.trigger('drconnect-updatecart', [cartData]);
            }).on('drconnect-changecurrency', function(evt, c) {
                cartView.blockCartUI();
                self.client.updateShopper({currency: c}).then(function() {
                    $el.trigger('drconnect-changecurrency', [c]);

                    // this returns 201 with no content
                    cartView.showFeedback("Currency Settings Updated");
                    return;
                }, function() {
                    cartView.showFeedback("Unable to update Currenct Settings", true);
                    return;
                }).done(function() {
                    cartService.clearCache();
                    cartService.getActiveCart().then(function(cartData) {
                        cartView.updateCartSummary(cartData);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    });
                });
            }).on('drconnect-applycoupon', function(evt, field, btn) {
                var v = $(field).val();
                if (v != null) {
                    cartService.applyCouponCode(v).then(function(cartData) {
                        // $el.trigger('drconnect-applycoupon', [v, field, cartData]);
                        cartView.showFeedback("Coupon code applied. Final price will be determined at checkout.");
                        $(field).val("");
                        cartView.updateCartSummary(cartData);
                        cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                        cartView.hideCouponEntry();
                    });
                }
            }).on('drconnect-cartrender', function(evt) {
                $el.trigger('drconnect-cartrender');
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
                    cartView.updateCartSummary(cartData);
                    cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                    cartView.setCurrency(cartData.pricing.orderTotal.currency);
                } else {
                    self.client.shopperService.list().then(function(shopper) {
                        if (shopper.currency) {
                            cartView.updateCartSummary(cartData);
                            cartView.updateCart(cartData, cartService.getEmptyCartOffer());
                            cartView.setCurrency(shopper.currency);
                        } else {
                            cartView.setCurrency(config.getDefaultCurrency());
                            self.client.updateShopper({
                                currency: config.getDefaultCurrency(),
                                locale: config.getDefaultLocale()
                            }).then(function(s) {
                                cartView.updateCartSummary(cartData);
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

            if (self.options.emptyOfferPop) {
                config.setEmptyOfferPop(self.options.emptyOfferPop);
            }

            if (self.options.siteId) {
                config.setSiteId(self.options.siteId);
            }

            if (self.options.vanityDomain) {
                config.setVanityDomain(self.options.vanityDomain);
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