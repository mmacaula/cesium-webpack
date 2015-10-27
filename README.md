using webpack with cesium js

start off with a webpack config

npm install or download (show how you can npm install without package.json)

if pre-1.15, delete all package.json files in Source

run ant build

copy all the assets and stuff to your public directory


require in your cesium assets.

Or show how to require in a cesium.js bundle


two ways of using webpack: requiring in just the source you need (recommended)

or using cesium.js bundle


npm install -g webpack

# Cesium and Webpack

This tutorial will show how you can use the [webpack](http://webpack.github.io/) module bundler with [Cesium](http://cesiumjs.org).  Some basic knowlege of Webpack will be assumed but code samples will be provided for reference.  These code samples are located [here](https://github.com/mmacaula/cesium-webpack).  There are two ways to use Cesium with webpack, the first is to use the pre-built bundle that is provided with every release, the other way is to `require` individual Cesium files and let Webpack make sure everything is properly included.  This tutorial will cover both paths to using Cesium in your application.

## Setting the stage

### Cesium is hard for bundlers
Cesium is a complex library, making it slightly harder to integrate in with module bundlers like webpack, require.js, and browserify.  You can't just point to a single file and say `require('cesium')` and be done.  Cesium uses webworkers for performance (in separate files) and has images used for basic layers and calculations stored as json (also in separate files).  In short, it has a lot of extra assets that don't fit the typical mould of a javascript library.

### Why does Webpack have trouble with Cesium?
Webpack is a very powerful bundler, it has the ability to parse both AMD and Common.js modules together without crazy shimming, and has a powerful ability to trace dependencies of your code, not just across javascript files you define as dependencies, but it can also allow you to say that you need a css file for a particular module, and if that css file references a font file that is served locally, webpack can make sure that the font file is copied over and placed in a place your css and browser will know where to find it.

This feature is great for your application, but it can get a little tricky when webpack tries to trace these dependencies for a complex library like Cesium that wasn't built with webpack.

Luckily Webpack has a huge list of plugins and is very modular.  There are two basic ways of getting it to work with Cesium.  Using the pre-compiled version, and using the source files directly.

## Using the pre-compiled version of Cesium

This method essentially tells webpack to pull in the Cesium.js file like you would at the top of your `<html>` tag.

### Pre-reqs
Install Node, Webpack and Webpack-Dev-Server.

    npm install -g webpack webpack-dev-server

You'll need to install all the dependencies located in the package.json (link here) for the source code example.  `npm install`

### Steps

1.  Copy the built version of cesium to your project, in this example its in the 'lib' directory.

2.   Next, copy over all the files from `lib/Cesium/*` to `./public`, creating the `public` directory if you haven't already done so.  Note:  `public` should NOT be checked into your source control.

3.  Create an app.js file in your project, and make it look like this:
    ``` javascript
    window.CESIUM_BASE_URL = './';
    require('./lib/CesiumUnminified/Cesium.js');
    require('./lib/Cesium/Widgets/widgets.css');
    var Cesium = window.Cesium;

    var viewer = new Cesium.Viewer('cesiumContainer');
    ```

    This is your web application's "entry" point, defined later in our webpack config.  In it, we do 3 things.  First, we set the "CESIUM_BASE_URL" property to be './'.  This is the URL that Cesium uses for AJAX requests to the server.  Since everything is served out of 'public' in our example, we're telling Cesium to look there.  Cesium will make requests to our 'public/Assets/Textures/*' directory (as an example).  Since we moved 'Assets' in step 2 above, we're making sure everything lines up.

    Next we `require` Cesium.js, I'm doing the unminified version but you can switch yours to do the minified version.  This is where we're pulling in the main Cesium.js into our project.

    Next, we `require` in our widgets.css file.  Huh?  Yeah, webpack will let you 'require' css files, it will take care of making sure all the css is coped over for us.  It's a little strange, and an optional step (you can put the css link in your own index.html), but you get used to it.

    Finally, after Cesium is `require`d, it's sitting on the global namespace as 'Cesium'.  So we grab it and instantiate a viewer on a div with id 'cesiumContainer'.

    So far so good, but how do we tell webpack to do its thing?  That's in the webpack.config.js file coming up next.


4.  Create a webpack.config.js file, and make it look like this:
    ``` javascript
    var HtmlPlugin = require('html-webpack-plugin');

    module.exports = {
        entry: "./app.js",
        output: {
            path: __dirname + '/public',
            filename: "bundle.js"
        },
        plugins: [
            new HtmlPlugin({
                template: 'index.html',
                inject : true
            })
        ],
        devServer: {
            contentBase: './public',
        },
        module: {
            loaders: [
                { test: /\.css$/, loader: "style!css" },
                {
                    test: /\.(png|gif|jpg|jpeg)$/,
                    loader: 'file-loader'
                },
                { test: /Cesium\.js$/, loader: 'script' }
            ]
        }
    };
    ```

    This is the main config file for webpack, telling it how to load up any asset you 'require'.  First off, you'll see the 'entry' field, which specifies 'app.js' from above as our 'entry'.  Next, is the 'output' config, which says put everything in the 'public' directory' and name the final bundle 'bundle.js'.  Next, we have the 'plugins'.  We're using HtmlPlugin, which let's us have a little control over our html file (note you could skip this step too and just put an index.html file in 'public').  We'll cover index.html in a later step.  Next up, devServer, which tells webpack-dev-server to serve everything up from 'public'.

    Finally, we get to the 'loaders' section.  Each entry here has a regex 'test' and a loader that matches it.  The first one is our css loader, saying that if a file ends in '.css', use the css loader, which is what allows us to `require` css.

    Did you know the widgets.css file loads up other files, some of which have urls referencing images?  Webpack is smart enough to trace all these down, and make sure they're all available to you, but it has to know what to do when it finds a file that ends in .png.  That's what the 'file-loader' will do.

    Finally, we have a regex for Cesium.js and we tell Webpack to use the 'script' loader.  This is equivalent to having webpack put a 'script' tag on your page and runs the script like that.

5. Finally, create an index.html file, and make it look like:
    ``` html
    <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body>
            <div id="cesiumContainer"></div>
        </body>
    </html>
    ```

    Our app.js file is creating a new Viewer on a div with id 'cesiumContainer'.  So we need to make sure we have a div there.  This HTML file let's us create our initial app structure right away.  Webpack will insert the bundled app.js (with everything else) in our index.html for us (that's what that `inject: true` setting does).

6.  With all that setup, you should be able to run `webpack-dev-server` on your console and navigate to localhost:8080 to and see your Cesium viewer up and running.

If you are a webpack expert, you'll probably see a lot of steps in here that aren't strictly necessary, but this will get you started.








