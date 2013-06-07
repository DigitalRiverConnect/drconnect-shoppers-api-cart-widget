/*jslint browser: true, nomen: true, sloppy: true, white: true */
define(['underscore', 'view/BaseView'], function(_, BaseView) {
    var defaults = {
        offerTemplate : 
        '<div class="connect-product-offer span4">' +
            '<p class="connect-cart-title"><%= displayName %></p>' +
            '<% if (pricing && (pricing.listPrice.value > pricing.salePriceWithQuantity.value)) { %>' +
            '<p><img class="connect-cart-image" src="<%= thumbnailImage %>" alt=""/>'+
            '<span class="connect-cart-pricing connect-widget-strikethrough"><%= pricing.formattedListPrice %></span><br/>' +
            '<span class="connect-cart-pricing"><%= pricing.formattedSalePriceWithQuantity %></span>' +
            '<%} else { %>'  +
            '<p><span class="connect-cart-pricing"><%= pricing.formattedSalePriceWithQuantity %></span>' +
            '<% } %>' +
            '<% if (typeof addProductToCart !== "undefined") {%>' +
            '    <div class="connect-widget-button"><button class="connect-cart-buy" value="<%= addProductToCart.uri %>" type="button">Add</button></div>' +
            '<%} else {%>' +
            '    <div class="connect-widget-button"><button class="connect-cart-buy" value="<%= uri %>" type="button">Add</button></div>' +
            '<%}%>' +
            '</p><div style="line-height: 1; clear: both;"></div>' + 
        '</div>'
    };

    return BaseView.extend({
        // @override
        init : function() {
            var self = this;
            self._super.apply(self, arguments);
        },

        // @override
        compileTemplates : function() {
            this.offerTemplate = _.template(this.getOption('offerTemplate'));
        },

        // @override
        getDefaults : function() {
            return defaults;
        },

        updateHomePageOffers : function(domElement, offers) {
            var self = this,
                html = "";

            if (offers.length) {
                _.each(offers, function(offer) {
                    html += self.offerTemplate(offer);
                });
                $(domElement).empty().html(html)
                    .off('click', 'button.connect-cart-buy')
                    .on('click', 'button.connect-cart-buy', function() {
                        $(self).trigger('drconnect-addtocart', [this]);
                    });
            }
            $(domElement).trigger('update', [self, offers]);
        }
    });
});