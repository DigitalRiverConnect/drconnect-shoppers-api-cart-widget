##AMD
The project is built using the requirejs Asynchronous Module Definition (AMD) 
framework. For more information, see the [requirejs](http://requirejs.org/ "Link to requirejs") web site.

##To Build the Optimized Project
### Install the Dependencies
This project requires NodeJS to install modules to build the project, and Bower to manage client libraries. Please
refer to the [NodeJS](http://nodejs.org) web site to install and configure NodeJS for your runtime.

#### Bower for Client Libraries
With Node successfully installed, the next step is to install Bower. Usually this should be done globally

```
npm install -g bower
```

### Install Node Dependencies
With bower installed globally, you should be able to install the project dependencies with the following command:

```
npm install && bower install
```

### Build the Project
The optimzer for Require - r.js - requires Node.js or Rhino.jar. To build
with Node, use the following command from the project root directory:

```
 $ node node_modules/requirejs/bin/r.js -o build/build.minicart.js name=../node_modules/almond/almond
```

By default this will put the optimized file mini-cart.min.js in the output
directory. You can be change the build options by editing the build.minicart.js
file in the root directory.

See [NodeJS.org](http://nodejs.org/ "Link to Node.JS") for instructions on downloading and configuring node.


### Deploy the Mini-cart
1. Copy the CSS files in the /css folder in the project root and put them where you
would normally keep css files. There are two files to copy:
    * /css/connect-mini-cart.css - contains positioning rules; edit with caution
    * /css/connect-widget-light.css - contains an example implentation of a theme

2. Build the Optimized Javascript file (see above). Copy the optimized file from
the output directory to your project.

3. Create an HTML file and reference the JavaScript and CSS from steps 1 and 2. Add
HTML elements for the mini-cart and cart summary.

4. Create a constructor script. The constructor is used to set options such as API Key and currency at runtime. 
See the example HTML file and constructor arguments.

####Example HTML File

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SuperCool DR Connect API Test Store</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="css/connect-mini-cart.css" rel="stylesheet">
    <link href="css/connect-widget-light.css" rel="stylesheet"></head>
<body>
    <div id="drMiniCartSummary"></div>
    <div id="drMiniCart"></div>

    <!-- jQuery is required. Tested with 1.8 - 1.10 + -->
    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
    <script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>

    <script src="output/mini-cart.min.js"></script>

    <script>
        // Example mini-cart constructor
        requirejs(["dr-minicart"], function(MiniCart) {
            var cart = new MiniCart({
                apiKey: 'xxxxxxxxxxxxxxxxxxxxxxx',
                siteId: 'acme'
            });
        });
    </script>
</body>
</html>
```

####Arguments to the Constructor
<table>
<tr>
    <th>Name</th><th>Type</th><th>Required</th>
</tr>
<tr>
    <td>apiKey</td><td>String</td><td>yes*</td>
</tr>
<tr>
    <td>client</td><td>api/Client Object</td><td>yes*</td>
</tr>
<tr>
    <td>siteId</td><td>String</td><td>yes</td>
</tr>
<tr>
    <td>vanityDomain</td><td>String</td><td>No (default "store.digitalriver.com"'")</td>
</tr>
<tr>
    <td>cartElement</td><td>String</td><td>No (default "drMiniCart")</td>
</tr>
<tr>
    <td>summaryElement</td><td>String</td><td>No (default "drMiniCartSummary")</td>
</tr>
<tr>
    <td>currency</td><td>Array of strings</td><td>No (default ['USD'] )</td>
</tr>
<tr>
    <td>defaultCurrency</td><td>String</td><td>No (default "USD")</td>
</tr>
<tr>
    <td>emptyOfferId</td><td>String</td><td>No</td>
</tr>
<tr>
    <td>emptyOfferPop</td><td>String</td><td>No (default "SiteMerchandising_EmptyCart")</td>
</tr>
<tr>
    <td>rewriteLinks</td><td>Boolean</td><td>No (default true)</td>
</tr>
</table>

\* _use either a fully constructed client object or an api key. If a constructed client
object is passed, apiKey is ignored. If not, it will be used to construct a client object._

####Accessing Other Modules
Other script modules can be pulled in to the require block as needed. The most common
uses would be to pull in the api/Client module to construct a client to share between
to applications.

```javascript
<script>
    requirejs(["minicart", "api/Client"], function(MiniCart, Client) {
        var client = new Client('69ae4fa2eb7bc4dc5057d4b17356c8ca');
        var cart = new MiniCart({
            client: client,
            siteId: 'shopme'
        });
        // Use client in some other widget code.
    });
</script>
```

Copyright 2013 Digital River, Inc.
