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
