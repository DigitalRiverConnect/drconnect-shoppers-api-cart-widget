AMD
The project is built using the requirejs Ansynchronis Module Definition (AMD) 
framework.For more information, see the requirejs web site: 
http://requirejs.org/

Almond
To keep the files smaller, the project uses Almond, a replacement AMD loader
for RequireJS:

https://github.com/jrburke/almond

To Build the Optimized Project
The optimzer for Require - r.js - requires Node.js or Rhino.jar. To build
with Node, use the following command from the project root directory

 > node rq/node_modules/requirejs/bin/r.js -o build.minicart.js name=rq/almond

By default this will put the optimized file mini-cart.min.js in the output
directory. You can be change the build options by editing the build.minicart.js
file in the root directory.

See http://nodejs.org/ for instructions on downloading and configuring node.


To Deploy the Mini-cart
1. Copy the CSS files in the /css folder in the project root and put them where you
would normally keep css files. There are two files to copy:
    /css/connect-mini-cart.css - contains positioning rules; edit with caution
    /css/connect-widget-light.css - contains an example implentation of a theme

2. Build the Optimized Javascript file (see above). Copy the optimized file from
the output directory to your project.

3. Create an HTML file and reference the JavaScript and CSS from steps 1 and 2. Add
HTML elements for the mini-cart and cart summary. 

Example HTML File

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>SuperCool DR Connect API Test Store</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="css/connect-mini-cart.css" rel="stylesheet">
    <link href="css/connect-widget-light.css" rel="stylesheet">
</head>
<body>

    <div id="drMiniCartSummary"></div>
    <div id="drMiniCart"></div>
    <script>
        // the mini-cart constructor
        requirejs(["minicart"], function(MiniCart) {
            var cart = new MiniCart({
                apiKey: '69ae4fa2eb7bc4dc5057d4b17356c8ca'
            });
        });
    </script>
</body>
</html>


4. Create a constructor script
The constructor is used to set options such as API Key and currency at runtime. . An example
placement is shown in step 3.


Example Constructor

<script>
    requirejs(["minicart"], function(MiniCart) {
        var cart = new MiniCart({
            apiKey: '69ae4fa2eb7bc4dc5057d4b17356c8ca',
            siteId: 'shopme'
        });
    });
</script>

Arguments to the Constructor
Name                Type                Required
apiKey              String              yes
siteId              String              yes
vanityDomain        String              No (default 'store.digitalriver.com')
cartElement         String              No (default 'drMiniCart')
summaryElement      String              No (default 'drMiniCartSummary')
currency            Array of strings    No (default [‘USD’] )
defaultCurrency     String              No (default ‘USD’)
emptyOfferId        String              No
emptyOfferPop       String              No (default ‘SiteMerchandising_EmptyCart’)
rewriteLinks        Boolean             No (default true)



copyright 2013 Digital River, Inc.
