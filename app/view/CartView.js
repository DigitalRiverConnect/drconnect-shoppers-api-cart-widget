define([
    'underscore',
    'view/BaseView'
], function (_, BaseView) {
    console.log(_);
    var defaults = {
        summaryTemplate :
        '<div class="connect-cart-summary">' +
            '<h3><span>Shopping Cart</span> (<span class="connect-cart-quantity"><%= qty %></span>)</h3>' +
        '</div>',

        cartTemplate : '<div id="drMiniCart" class="connect-mini-cart"></div>',

        cartHeaderTemplate:
        '<div class="connect-cart-header">' +
        '   <div class="connect-cart-feedback"></div>' +
        '   <div class="connect-cart-currency">' +
        '       <label for="drCartCurrencySelector">Currency:</label>' +
        '       <select id="drCartCurrencySelector" class="connect-cart-currencyselector">' +
        '       </select>' +
        '   </div>' +
        '</div>' +
        '<div class="connect-cart-offerheader"></div>',

        bodyTemplate :
        '<div class="connect-cart-body connect-loading">' +
        '   <div class="connect-cart-loadingmask">' +
        '      <span class="connect-spinner"></span>' +
        '   </div>' +
        '   <div class="connect-content">' +
        '       <%= emptyCartMessage %>' +
        '   </div>' +
        '</div>',

        emptyCartTemplate :
        '<p>Your Shopping Cart is empty.</p>',

        totalsTemplate :
        '<div class="connect-cart-totals">' +
        '   <div class="connect-cart-subtotal">' +
        '       <span>Subtotal:</span><span class="amount">0.00</span>' +
        '</div>' +
        '   <div class="connect-fine-print">' +
        '       <span>Excludes tax and shipping</span>' +
        '   </div>' +
        '</div>',

        couponTemplate :
        '<div class="connect-cart-couponwrapper connect-widget-button">' +
        '    <input id="couponCode" class="connect-widget-couponcode" type="text" value="" placeholder="Enter Coupon Code"/>' +
        '    <a class="connect-cart-applycoupon" disabled="disabled" href="#">' +
        '        <i class="icon-ok-sign"></i> Apply Code' +
        '    </a>' +
        '</div>',

        footerTemplate :
        '<div class="connect-cart-footer">' +
        '    <div class="connect-widget-link">' +
        '        <a href="#" class="connect-cart-showcode">Have a Promo Code?</a>' +
        '    </div>' +
        '    <div class="connect-widget-button right">' +
        '        <a href="#" class="connect-cart-checkout"><i class="icon-shopping-cart icon"></i> Checkout</a>' +
        '    </div>' +
        '    <div class="connect-widget-clearfix"></div>' +
        '</div>',

        // for empty cart merchandising
        offerHeaderTemplate :
        '<span><%= offerHeader %></span>',

        offerTemplate :
        '<div class="connect-cart-offer">' +
            '<p class="connect-cart-title"><%= product.displayName %></p>' +
            '<% if (pricing && (pricing.listPrice.value > pricing.salePriceWithQuantity.value)) { %>' +
            '<p><img class="connect-cart-image" src="<%= product.thumbnailImage %>" alt=""/>' +
            '<span class="connect-cart-pricing"><span>Regular Price: </span>' +
            '<span class="connect-widget-strikethrough"><del><%= pricing.formattedListPrice %></del></span></span>' +
            '<span class="connect-cart-pricing"><span>Promo Price: </span>' +
            '<span><%= pricing.formattedSalePriceWithQuantity %></span></span>' +
            '<%} else { %>'  +
            '<p><img class="connect-cart-image" src="<%= product.thumbnailImage %>" alt=""/>' +
            '<span class="connect-cart-pricing"><%= pricing.formattedSalePriceWithQuantity %></span>' +
            '<% } %>' +
            '<div class="connect-widget-button"><a class="connect-cart-buy" data-value="<%= addProductToCart.uri %>" href="<%= addProductToCart.uri %>">' +
            '<i class="icon-plus-sign"></i> Add</a></div>' +
            '</p><div style="line-height: 1; clear: both;"></div>' +
        '</div>',

        productTemplate :
        '<div class="connect-cart-lineitem">' +
            '<p class="connect-cart-title" title="<%= product.shortDescription %>"><%= product.displayName %></p>' +
            '<img src="<%= product.thumbnailImage %>"/>' +
            '<div><span>Quantity: </span>' +
            '   <input autocomplete="off" type="text" class="connect-cart-quantity" data-lineitem-id="<%= id %>" value="<%= quantity %>"' +
            '<% if (product.inventoryStatus && product.inventoryStatus.maxOrderQuantity !== undefined){ %>' +
            ' data-maxorderquantity=<%=product.inventoryStatus.maxOrderQuantity%>' +
            '<%} %>' +
            '/>' +
            '   <span class="connect-widget-button"><a class="connect-cart-updatebtn" href="#"><i class="icon-refresh"></i></a></span>' +
            '</div>' +
            '<ul>' +
                '<li class="connect-cart-remove"><span><a href="#" data-lineitem-id="<%= id %>"><i class="icon-remove"></i> Remove</a></span></li>' +
                '<li class="connect-cart-sku"><span class="connect-cart-label">SKU: <%= product.sku %></span></li>' +
                //'<li class="connect-cart-producttype">Product Type: <span><%= product.productType %></span></li>' +
                '<li class="connect-lineitem-pricing">' +
                    '<span class="connect-cart-label">Price: </span>' +
                    '<% if (pricing.listPriceWithQuantity.value > pricing.salePriceWithQuantity.value) { %> ' +
                    '<span class="connect-widget-strikethrough"><%= pricing.formattedListPriceWithQuantity %>&nbsp;</span>' +
                    '<%}%>' +
                    '<span class="connect-lineitem-saleprice"><%= pricing.formattedSalePriceWithQuantity %></span>' +
                '</li>' +
            '</ul>' +
            '<div style="line-height: 1; clear: both;">&nbsp;</div>' +
        '</div>',

        subtotalTemplate :
        '<% if (discount.value && discount.value > 0) { %>' +
        '<div class="connect-cart-orderdiscount">' +
            '<span>Discount: </span><span class="amount">-<%= formattedDiscount %></span>' +
        '</div> <%}%>' +
        '<% if (shippingAndHandling.value != null) { %>' +
        '<div class="connect-cart-orderdiscount">' +
            '<span>Estimated Shipping: </span><span class="amount"><%= formattedShippingAndHandling %></span>' +
        '</div> <%}%>' +
        '<div class="connect-cart-subtotal">' +
            '<span>Subtotal: </span><span class="amount"><%= formattedOrderTotal %></span>' +
        '</div>' +
        '<div class="connect-fine-print">' +
            '<span>Excludes tax</span>' +
        '</div>',

        feedbackTemplate :
        '<p><i class="icon-ok-sign"></i> <%= msg %></p>',

        errorTemplate:
        '<p><i class="icon-warning-sign"></i> <%= msg %></p>',

        // the default cart element
        summaryElementSelector : '#drMiniCartSummary',

        // the default summary element
        cartElementSelector : '#drMiniCart',
        currency: ['USD'],
        defaultCurrency: 'USD'
    };

    // Utility Functions
    function createCartSummary(cartData) {
        var self = this,
            o = self.getOptions();

        // TODO if an summaryAnchorSelector is not provide, insert an element in the DOM
        $(o.summaryElementSelector).append(self.summaryTemplate(cartData));
    }

    // these templates are only used once so they are not compiled.
    function createCart() {
        var self = this,
            o = self.getOptions(),
            $cart = $('<div class="connect-cart-wrapper"></div>').appendTo(o['cartElementSelector']),
            headerTemplateHtml, bodyTemplateHtml, totalTemplateHtml, couponTemplateHtml, footerTemplateHtml, emptyCartHtml;

        // insert the header
        headerTemplateHtml = $('#drMiniCartHeaderTemplate');
        if (headerTemplateHtml.length) {
            headerTemplateHtml = headerTemplateHtml.get(0).html();
        } else {
            headerTemplateHtml = _.template(o.cartHeaderTemplate);
        }
        $cart.prepend(headerTemplateHtml);

        // add the currencies ...
        _.each(o.currency, function (cv) {
            var $option = $('<option value="' + cv + '">' + cv + '</option>');
            if (cv === o.defaultCurrency) {
                $option.attr("selected", "selected");
            }
            $cart.find('.connect-cart-currencyselector').append($option);
        });

        // insert the body
        bodyTemplateHtml = $('#drMiniCartBodyTemplate');
        if (bodyTemplateHtml.length) {
            emptyCartHtml = o.emptyCartTemplate;
            bodyTemplateHtml = bodyTemplateHtml.get(0).html();
        } else {
            emptyCartHtml = o.emptyCartTemplate;
            bodyTemplateHtml = _.template(o.bodyTemplate, {emptyCartMessage: emptyCartHtml});
        }
        $cart.append(bodyTemplateHtml);

        // insert the totals
        totalTemplateHtml = $('#drMiniCartTotalTemplate');
        if (totalTemplateHtml.length) {
            totalTemplateHtml = totalTemplateHtml.get(0).html();
        } else {
            totalTemplateHtml = _.template(o.totalsTemplate);
        }
        $cart.append(totalTemplateHtml);

        // insert the coupon code block
        couponTemplateHtml = $('#drMiniCartCouponTemplate');
        if (couponTemplateHtml.length) {
            couponTemplateHtml = couponTemplateHtml.get(0).html();
        } else {
            couponTemplateHtml = _.template(o.couponTemplate);
        }
        $cart.append(couponTemplateHtml);

        // insert the footer
        footerTemplateHtml = $('#drMiniCartFooterTemplate');
        if (footerTemplateHtml.length) {
            footerTemplateHtml = _.template(footerTemplateHtml.html());
        } else {
            footerTemplateHtml = _.template(o.footerTemplate);
        }
        $cart.append(footerTemplateHtml);
    }

    // Main object

    return BaseView.extend({
        // @override - the constructor function

        init: function () {
            var self = this, $cart;

            self._super.apply(self, arguments);

            createCartSummary.call(self, {qty: 0, subtotal: "0.0"});
            createCart.call(self);

            $cart = $(self.getOption('cartElementSelector'));
            $cart.on('change', '.connect-cart-currencyselector', function () {
                var v = $(this).val();
                $(self).trigger('drconnect-changecurrency', [v]);
            });

            // set up the listener for have promo code link? 
            $cart.find('.connect-cart-showcode').on("click", function (evt) {
                evt.preventDefault();
                $(this).hide();
                $cart.find('.connect-cart-couponwrapper').show().find('> input').select().focus();
            });

            // set up the listener for the coupon code input 
            $('#couponCode').on("keypress paste", function () {
                var $link = $(this);
                if ($link.val() !== '' || $link.val() != null) { // != for null or undefined
                    $link.parent('.connect-cart-couponwrapper').find('>a[class^="connect-"]').removeAttr('disabled');
                }
            });
        },
        // @override
        getDefaults : function () {
            return defaults;
        },
        // @override
        compileTemplates : function () {
            var self = this;
            self.compileSummaryTemplate();
            self.compileCartOfferTemplate();
            self.offerHeaderTemplate = _.template(self.getOption('offerHeaderTemplate'));
            self.compileProductTemplate();
            self.compileSubtotalTemplate();
            self.feedbackTemplate = _.template(self.getOption('feedbackTemplate'));
            self.errorTemplate = _.template(self.getOption('errorTemplate'));
            self.emptyCartTemplate = _.template(self.getOption('emptyCartTemplate'));
        },

        compileSummaryTemplate : function () {
            var self = this,
                summaryTemplateHTML = $('#drMiniCartSummaryTemplate');

            // check to see if the summary template is overridden in the implementation.
            if (summaryTemplateHTML.length) {
                self.summaryTemplate = _.template(summaryTemplateHTML.html());
            } else {
                self.summaryTemplate = _.template(self.getOption('summaryTemplate'));
            }
        },

        compileCartOfferTemplate : function () {
            var self = this, cartOfferTemplateHTML = $('#drMiniCartOfferTemplate');

            if (cartOfferTemplateHTML.length) {
                self.cartOfferTemplate = _.template(cartOfferTemplateHTML.html());
            } else {
                self.cartOfferTemplate = _.template(self.getOption('offerTemplate'));
            }
        },

        compileProductTemplate : function () {
            var self = this, productTemplateHTML = $('#drMiniCartProductTemplate');

            if (productTemplateHTML.length) {
                self.productTemplate = _.template(productTemplateHTML.html());
            } else {
                self.productTemplate = _.template(self.getOption('productTemplate'));
            }
        },

        compileSubtotalTemplate : function () {
            var self = this, subtotaTemplateHTML = $('#drMiniCartSubtotalTemplate');
            if (subtotaTemplateHTML.length) {
                self.subtotalTemplate = _.template(subtotaTemplateHTML.html());
            } else {
                self.subtotalTemplate = _.template(self.getOption('subtotalTemplate'));
            }
        },
        // @override 
        setOptions : function (options) {
            if (options.summaryElement) {
                options.summaryElementSelector = "#" + options.summaryElement;
            }

            if (options.cartElement) {
                options.cartElementSelector = "#" + options.cartElement;
            }
            this._super.apply(this, [options]);
        },

        updateCartSummary : function (cartData) {
            var self = this,
                $el = $(self.getOption('summaryElementSelector')),
                data = {}, html;

            // make sure that values exist
            data.qty = cartData.totalItemsInCart || '0';
            if (cartData.pricing != null) {
                data.subtotal = cartData.pricing.formattedOrderTotal;
            } else {
                data.subtotal = '0.0';
            }

            if ($el.length) {
                html = self.summaryTemplate(data);
                $el.html(html);
            }
        },
        /**
         * 
         * @param {Object} cartData
         * @param {Promise} emptyOffers
         * 
         */
        updateCart : function (cartData, emptyOffers) {
            var self = this,
                $cart = $(self.getOption('cartElementSelector'));

            // branch.. if cartData.lineItems && cartData.lineItems.lineItem.length ..
            // show line items 
            if (cartData.lineItems && cartData.lineItems.lineItem && cartData.lineItems.lineItem.length) {
                self.showLineItems($cart, cartData);
            } else {
                emptyOffers.then(function (offer) {
                    self.showEmptyCartOffers($cart, offer);
                });
            }
            $(self).trigger('drconnect-cartrender');
        },

        showLineItems : function ($cart, cartData) {
            var self = this,
                items = [];

            $cart.find('.connect-cart-offerheader').hide().end()
                .find('.connect-cart-totals').show().end()
                .find('.connect-cart-footer').show()
                .find('.connect-cart-showcode').show();

            try {
                items = cartData.lineItems.lineItem || [];
            } catch (ignore) {
                // ignore lineItem not defined error
            }

            self.renderLineItems($cart, items);

            // add behaviors if this cart has not been initialized.
            self.setupEventListeners($cart);
            self.updateCartSubtotal(cartData);

            $(self).trigger('drconnect-updatecart', [cartData]);
        },

        renderLineItems : function ($cart, lineItems) {
            var self = this,
                html = "";

            _.each(lineItems, function (lineItem) {
                var product, inventoryStatus, availableQuantity;
                if (lineItem && lineItem.product !== undefined && lineItem.product.inventoryStatus !== undefined) {
                    // make local references for speed/convenience
                    product = lineItem.product;
                    inventoryStatus = lineItem.product.inventoryStatus;

                    // cast available quantity to a number
                    availableQuantity = parseInt(inventoryStatus.availableQuantity, 10);
                    if (!isNaN(availableQuantity)) {
                        inventoryStatus.availableQuantity = availableQuantity;
                    }
                    // add a max order property: max order = inventory status available quantity - quantity.
                    // if the product defines a maxOrderQuantity, use that

                    if (product.maxOrderQuantity !== undefined) {
                        inventoryStatus.maxOrderQuantity = product.maxOrderQuantity;
                    } else {
                        // if product.maxOrderQuantity is not set, and prodcutIsAllowsBackorders is false, don't
                        // set a maxOrderValue. Else set it to availableQuantity - liteItem.quantity;
                        if (inventoryStatus.productIsAllowsBackorders === "false" || inventoryStatus.productIsAllowsBackorders === false) {
                            inventoryStatus.maxOrderQuantity = (availableQuantity - lineItem.quantity);
                        }
                    }
                    // allow setting the quantity to zero if minOrderQuantity is not set.
                    inventoryStatus.minOrderQuantity = product.minOrderQuantity || 0;
                } else {
                    // not sure what to do here ... feels like an error.
                }

                html += self.productTemplate(lineItem);
            });

            $cart.find('.connect-cart-body .connect-content').empty().html(html).end();
        },

        setupEventListeners : function ($cart) {
            var self = this;

            if (!$cart.hasClass('initialized')) {
                $cart.addClass('initialized')
                    .on('keypress', 'input[type="text"]', function (evt) {
                        // listen for the enter key
                        if (evt.keyCode === 13) {
                            $(self).trigger("drconnect-updatequantity", [this.value, this]);
                        }
                        evt.stopImmediatePropagation(); // no other listeners fire
                    }).on('click', '.connect-cart-remove a', function (evt) {
                        evt.preventDefault();
                        $(self).trigger('drconnect-remove', [this]);
                    }).on("click", ".connect-cart-applycoupon", function () {
                        if (!$(this).attr('disabled') && !$(this).hasClass('disabled')) {
                            var field = $('#couponCode').get(0);
                            $(self).trigger('drconnect-applycoupon', [field, this]);
                        }
                        return false; // prevent default and stop propagation
                    }).on('click', '.connect-cart-buy', function (evt) {
                        evt.preventDefault();
                        // normalize this behavior for buttons or a tag
                        var v = this.value || this.href;
                        $(self).trigger('drconnect-addtocart', [{value: v}, this]);
                    }).on("click", ".connect-cart-updatebtn", function () {
                        var $btn = $(this), $field;
                        if (!$btn.attr('disabled') && !$btn.hasClass('disabled')) {
                            $field = $btn.siblings('input[type="text"]');
                            if ($field.length && $field.val() > -1) {
                                $(self).trigger("drconnect-updatequantity", [$field.val(), $field.get(0)]);
                            }
                        }
                        return false;   // prevent default and stop propagation
                    });
            }
        },

        updateCartSubtotal : function (cartData) {
            var self = this,
                pricing = cartData.pricing,
                $cart = $(self.getOption('cartElementSelector'));

            if (pricing && pricing.formattedOrderTotal != null) { // != null for null or undefined
                // fix an error in the data type
                if (pricing.discount && typeof pricing.discount.value === 'string') {
                    if (!isNaN(parseInt(pricing.discount.value, 10))) {
                        // cast value to a number
                        pricing.discount.value = parseInt(pricing.discount.value, 10);
                    }
                }
                if (pricing.shippingAndHandling && typeof pricing.shippingAndHandling.value === 'string') {
                    if (!isNaN(parseInt(pricing.shippingAndHandling.value, 10))) {
                        pricing.shippingAndHandling.value = parseInt(pricing.shippingAndHandling.value, 10);
                    }
                }
                $cart.find('.connect-cart-totals').empty().html(self.subtotalTemplate(pricing));
            } else {
                pricing = {formattedOrderTotal: "0.00", discount: {"value": 0}, shippingAndHandling: {"value": 0}};
                $cart.find('.connect-cart-totals').empty().html(self.subtotalTemplate(pricing));
            }
        },

        showEmptyCartOffers : function ($cart, offer) {
            var self = this;

            self.renderEmptyOffers($cart, offer);

            $cart.find('.connect-cart-totals').hide().end()
                .find('.connect-cart-couponwrapper').hide().end()
                .find('.connect-cart-footer').hide();

            self.setupEventListeners($cart);
            $(self).trigger('drconnect-updatecart', [offer]);
        },

        renderEmptyOffers : function ($cart, offer) {
            var self = this, html = '', offers = [], i, l;

            try {
                offers = offer.productOffers.productOffer;
            } catch (ignore) {
                // ignore error for productOffers or productOffer is undefined.
            }

            if (offers.length) {
                if (offer.salesPitch[0]) {
                    $cart.find('.connect-cart-offerheader').show()
                    .html(self.offerHeaderTemplate({offerHeader : offer.salesPitch[0]}));
                }

                for (i = 0, l = offers.length; i < l; i += 1) {
                    html += self.cartOfferTemplate(offers[i]);
                }
            } else {
                html = self.emptyCartTemplate();
            }

            $cart.find('.connect-cart-body .connect-content').empty().html(html).end();
        },

        hideCouponEntry : function () {
            var o = this.getOptions(), $cart;

            $cart = $(o.cartElementSelector);
            // hide the coupon input field
            $cart.find('.connect-cart-couponwrapper').hide()
                .find('>a[class^="connect-"]').attr('disabled', 'disabled');

            // show the Have a Promo Code ? link
            $cart.find('.connect-cart-showcode').show();
        },

        setCurrency : function (v) {
            var self = this,
                $cart = $(self.getOption('cartElementSelector')),
                currencySelector;

            currencySelector = $cart.find('.connect-cart-currencyselector');
            currencySelector.val(v);
        },

        blockCartUI: function () {
            var self = this,
                $cart = $(self.getOption('cartElementSelector'));

            // disable all of the buttons in the mini-cart div.
            // disable the currency selector.
            // mask the cart by adding a class name
            $cart.find('.connect-cart-body').addClass('connect-loading')
                .find('.connect-content').scrollTop(0).end()
                .find('.connect-cart-currencyselector').attr('disabled', 'disabled');
        },

        unblockCartUI: function () {
            var self = this;

            $(self.getOption('cartElementSelector'))
                .find('.connect-cart-body').removeClass('connect-loading')
                .find('.connect-content').scrollTop(0).end()
                .find('.connect-cart-currencyselector').removeAttr('disabled');
        },

        showFeedback : function (msg, isError) {
            var self = this, html,
                $cart = $(self.getOption('cartElementSelector')),
                $feedbackContainer = $cart.find('.connect-cart-feedback');

            // make sure that isError is set. 
            isError = !! isError;
            html = (isError ? self.errorTemplate({msg: msg}) : self.feedbackTemplate({msg: msg}));
            // clear the existing time out.
            if (self.feedbackTO !== null) {
                clearTimeout(self.feedbackTO);
                self.feedbackTO = null;

                // run the hide immediately to show the next message.
                self.hideFeedback(function () {
                        $feedbackContainer.toggleClass('connect-cart-error', isError).html(html).fadeIn();
                    });
            } else {
                $feedbackContainer.toggleClass('connect-cart-error', isError).html(html).fadeIn();
            }
            // show the feedback div, set a time out to hide it.
            self.feedbackTO = setTimeout(function () {
                self.hideFeedback();
            }, 5000);
        },

        hideFeedback : function (callback) {
            var self = this,
                $cart = $(self.getOption('cartElementSelector'));

            $cart.find('.connect-cart-feedback').fadeOut(function () {
                if (typeof callback === "function") {
                    callback.call(this);
                }
            });
        },

        getCartElement : function () {
            return $(this.getOption('cartElementSelector'));
        }
    });
});
