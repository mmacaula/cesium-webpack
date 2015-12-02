# Cesium and Webpack

This tutorial will show how you can use the [webpack](http://webpack.github.io/) module bundler with [Cesium](http://cesiumjs.org).  Some basic knowlege of Webpack will be assumed but code samples will be provided for reference.  These code samples are located [here](https://github.com/mmacaula/cesium-webpack).  There are two ways to use Cesium with webpack, the first is to use the pre-built bundle that is provided with every release, the other way is to `require` individual Cesium files and let Webpack make sure everything is properly included.  This tutorial will cover both paths to using Cesium in your application.

## Setting the stage

### Cesium is hard for bundlers
Cesium is a complex library, making it slightly harder to integrate in with module bundlers like webpack, require.js, and browserify.  You can't just point to a single file and say `require('cesium')` and be done.  Cesium uses webworkers for performance (in separate files) and has images used for basic layers and calculations stored as json (also in separate files).  In short, it has a lot of extra assets that don't fit the typical mould of a javascript library.

### Why does Webpack have trouble with Cesium?
Webpack is a very powerful bundler, it has the ability to parse both AMD and Common.js modules together without crazy shimming, and has a powerful ability to trace dependencies of your code, not just across javascript files you define as dependencies, but it can also allow you to say that you need a css file for a particular module, and if that css file references a font file that is served locally, webpack can make sure that the font file is copied over and placed in a place your css and browser will know where to find it.

This feature is great for your application, but it can get a little tricky when webpack tries to trace these dependencies for a complex library like Cesium that wasn't built with webpack.

Luckily Webpack has a huge list of plugins and is very modular.  There are two basic ways of getting it to work with Cesium.  Using the pre-compiled version, and using the source files directly.

If you are a webpack expert, or already have webpack up and running, just head on down to the bottom of this tutorial where I describe the steps without getting webpack setup.



## Using the pre-compiled version of Cesium

This method essentially tells webpack to pull in the Cesium.js file like you would at the top of your `<html>` tag.

### Pre-reqs
Install Node, Webpack and Webpack-Dev-Server.

    npm install -g webpack webpack-dev-server

You'll need to install all the dependencies located in the package.json (https://github.com/Aviture/cesium-webpack/blob/master/using-pre-built/package.json) for the source code example.  `npm install`

### Steps

1.  Copy the built version of Cesium to your project, in this example its in the 'lib' directory.

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

## Using the Source

Using the source directly can be your best bet when you really only want to pull in the parts of Cesium that you're using, and leave out the stuff you're not.  This can lead to faster loading times and keep your app more light-weight, always a good thing!  Unfortunately things can get slightly more tricky with this route with pre v1.15 Cesium, but we've got some steps mapped out and I'll identify which ones are optional if you're post 1.15

1.  (pre-v1.15 step).  Delete all package.json files in Cesium's `Source` directory. You can do this on *nix systems with this command:  `find path/to/Cesium/Source -name "package.json" -type f -delete`.  On Windows you should be able to run from the Source directory: `del /s package.json`.  Note this is untested and be careful as you type it.  To be safe, use `del /s /p package.json` which should ask for confirmation for each file.

2.  Build Cesium's source.  Pre v1.15, you'll need to run `ant build`.  This generates all the .js files you'll need.  If you are using post v1.15 Cesium, you'll build using `gulp`.

3.  Create an app.js file and make it look like this:
    ```
    require('cesium/Source/Widgets/widgets.css');
    var BuildModuleUrl = require('cesium/Source/Core/ buildModuleUrl');
    BuildModuleUrl.se tBaseUrl('./');

     var Viewer = require('cesium/Source/Widgets/Viewer/ Viewer');

    var viewer = new Viewer('cesiumContainer');
    ```

    This is our 'entry' point again.  It's slightly different than before.  We're still loading in the 'css' file via a `require` call, but instead of doing a `window.CESIUM_BASE_URL` we're loading in the `BuildModuleUrl` module and setting the base url there.

    Next we're `require`ing in the Viewer *from the source* directory.  This is how you'll use Cesium modules from now on.

    Finally we just use the viewer and instantiate it as before!

4.  Next, let's look at our 'webpack.config.js' file.
    ```
    var HtmlPlugin = require('html-webpack-plugin');

    module.exports = {
        entry: "./app.js",
        output: {
            path: __dirname + '/public',
            filename: "bundle.js",
            sourcePrefix: ''
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
            unknownContextCritical: false,
            loaders: [
                { test: /\.css$/, loader: "style!css" },
                {
                    test: /\.(png|gif|jpg|jpeg)$/,
                    loader: 'file-loader'
                }
            ]
        }
    };
    ```
    A lot of this is the same as before but with some differences:

    *  In the `output` object we have `sourcePrefix: ''`.  This is required because Cesium uses some multi-line strings in its code and [webpack indents them improperly](https://github.com/webpack/webpack/issues/1161).

    *  There's also the `unknownContextCritical : false` which tells webpack to ignore some warnings due to the way Cesium dynamically builds module paths.

5.   With all that setup, you should be able to run `webpack-dev-server` on your console and navigate to localhost:8080 to and see your Cesium viewer up and running.


## I've already got Webpack setup, just tell me how to use Cesium

You still have the two choices.  Pre-built or using Source.  **In both cases you need to pre-build Cesium and copy over the assets to your output directory**.

###  Pre-Built

1.  Setup a script loader `{ test: /Cesium\.js$/, loader: 'script' }` and make sure you have a file loader setup as well.

2.  Set the `CESIUM_BASE_URL` property.  `window.CESIUM_BASE_URL = './';` before you load or `require` Cesium.  `./` is assuming you just copy the assets directly to your output directory.  If you copy them to `output/Cesium` then change the path accordingly.

###  Using the Source

Pre-v1.15 you'll need a couple more steps, which you can integrate into your build process to automate:

1.  (pre-v1.15 step).  Delete all package.json files in Cesium's `Source` directory. You can do this on *nix systems with this command:  `find path/to/Cesium/Source -name "package.json" -type f -delete`.  On Windows you should be able to run from the Source directory: `del /s package.json`.  Note this is untested and be careful as you type it.  To be safe, use `del /s /p package.json` which should ask for confirmation for each file.

2.  Build Cesium's source.  Pre v1.15, you'll need to run `ant build`.  This generates all the .js files you'll need.  If you are using post v1.15 Cesium, you'll build using `gulp`.

3.  Your webpack config will at a minimum need these options configured.  **Note, you'll need more, but these options are the minimum to get Cesium working from source**:
    ```
    {
        output: {
            sourcePrefix: ''
        },
        module: {
            unknownContextCritical: false,
            loaders: [
                { test: /\.css$/, loader: "style!css" },
                {
                    test: /\.(png|gif|jpg|jpeg)$/,
                    loader: 'file-loader'
                }
            ]
        }
    }
    ```

    *  The `sourcePrefix`: '' is required because Cesium uses some multi-line strings in its code and [webpack indents them improperly](https://groups.google.com/forum/#!topic/cesium-dev/i7KAgG-IL5c).

    *  The `unknownContextCritical: false` is not strictly required, but Cesium (and the version of knockout included) uses dynamic module loading with require.js and this confuses webpack.  These warnings are safe to ignore and this flag ignores them.  Be careful though as this ignores all of those warnings.

    *  The loaders are probably already included in your webpack config but they are necessary to `require` the 'widgets.css' file and all the images they end up loading.

4.  Finally, you'll want to set the `BuildModuleUrl`'s base URL.  Before you require Cesium, place these statements:
    var BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
    BuildModuleUrl.setBaseUrl('./');


##  Using the examples:
You can see all of this in action [here](https://github.com/mmacaula/cesium-webpack) where there are two directories with sample projects setup.  The 'using-pre-built' has a working example with using pre-built Cesium and the 'using-source' directory has the same for using the source directly.

Each example can be run by following these steps:

1.  `cd` to the directory and run `npm install`.  Once it is done, this runs the 'postinstall.sh' script which takes care of some of the steps I mentioned above automatically.  **Note:  best to run this in git bash in windows or translate yourself to windows commands**

2.  run `npm start` which will run any pre-processing tasks and then startup webpack-dev-server

3.  Head on over to localhost:8080 to see Cesium running with webpack





