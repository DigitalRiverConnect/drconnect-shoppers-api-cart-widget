'use strict';
/*global requirejs*/
require.config({
    paths: {
        'jsonp': '../vendor/dr-jsonplib/jsonp',
        'underscore': '../vendor/lodash/dist/lodash.underscore',
        'q': '../vendor/q/q'
    },

    shim: {
        'underscore': {
            exports: '_'
        },

        'q': {
            exports: 'Q'
        }
    }
});

requirejs(["dr-minicart"], function (MiniCart) {
    var cart = new MiniCart({
        apiKey: 'IOGl4gRimt6h9gpPCfABcMjfPNKPzQer',
        siteId: 'kaboom'
    });
});