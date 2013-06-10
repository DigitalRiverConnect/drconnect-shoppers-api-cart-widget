AMD
The project is build using the requirejs Ansynchronis Module Definition (AMD) framework.
For more information, see the requirejs web site: http://requirejs.org/

Almond
To keep the files smaller, the project uses Almond, a replacement AMD loader
for RequireJS.

https://github.com/jrburke/almond

To Build and Optimized Project
The optimzer for Require - r.js - requires Node.js or Rhino. To build
with Node, use the following command from the project root directory

 > node rq/node_modules/requirejs/bin/r.js -o build.minicart.js name=rq/almond

By default this will put the optimized file mini-cart.min.js in the output directory.
The build options can be changed by editing the build.minicart.js file 
in the root directory. 


