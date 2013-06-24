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
    out: "output/mini-cart.min.js"
}