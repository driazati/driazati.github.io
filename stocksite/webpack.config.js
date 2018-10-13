const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: "./src/main.jsx",
    output: {
        path: path.resolve(__dirname, 'dist/assets'),
        filename: "bundle.js",
        publicPath: "assets"
    },
    resolve: {
        extensions: [".jsx"],
    },
    devServer: {
        inline: true,
        contentBase: './dist',
        port: 3000
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules)/,
                loader: "babel-loader",
                query: {
                    presets: ["latest", "stage-0", "react"]
                }
            }
        ]
    }
};