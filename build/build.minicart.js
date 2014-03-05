{
    baseUrl : '../app',
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
    },
    // optimize: "none",
    include: ['dr-minicart'],
    out: "dist/mini-cart.min.js"
}