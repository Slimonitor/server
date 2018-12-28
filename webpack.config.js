var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports = {
    entry: ['./components/entry.jsx'],
    output: {
        path: __dirname + '/static',
        filename: 'entry.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/env', '@babel/preset-react']
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                autoprefixer({
                                    browsers: ['last 2 versions'],
                                    cascade: false
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                loader: 'json-loader'
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                loader: 'url-loader'
            }
        ]
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    optimization: {
        minimize: process.env.NODE_ENV === 'production'
    }
};
