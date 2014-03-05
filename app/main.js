'use strict';

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
