{baseUrl : './',
    shim : {
        "lib/underscore" : {
            exports : '_'
        }
    },
    paths : {
        lib : 'lib',
        underscore: 'lib/underscore'
    },
    // optimize: "none",
    include: ['minicart'],
    out: "../../demo-ap/beacon/DRUI/webapps/cart-widget/js/mini-cart.min.js"
}