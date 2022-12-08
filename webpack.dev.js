const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');
const { BannerPlugin } = require('webpack');
var fs = require('fs');

module.exports = {
    // entry: ['babel-polyfill', './index.js'],
    entry: './umd.js',
    output: {
        path: path.join(__dirname, '/lib'),
        filename: 'index.js',
        library: 'WebChat',
        libraryTarget: 'umd',
    },
    devServer: {
        host: process.env.HOST, // Defaults to `localhost`
        port: process.env.PORT, // Defaults to 8080
        open: true, // Open the page in browser
        static: { directory: path.resolve(__dirname, '/lib') },
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            'react-native$': 'react-native-web',
        },
    },
    mode: 'development',
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'string-replace-loader',
                        options: {
                            search: 'PACKAGE_VERSION_TO_BE_REPLACED',
                            replace: version,
                        },
                    },
                    { loader: 'babel-loader' },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [path.resolve(__dirname, 'src/scss/')],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|png|gif|svg|woff|ttf|eot)$/,
                use: {
                    loader: 'url-loader',
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Web Chat Widget Test',
            filename: 'index.html',
            inject: false,
            template: 'dev/src/index.html',
            templateParameters: {
                chatbotEndpoint: process.env['CHATBOT_ENDPOINT'],
                customerId: process.env['CUSTOMER_ID'],
            },
            showErrors: true,
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: path.join(__dirname, '/static'), to: path.join(__dirname, '/lib') }],
        }),
        new BannerPlugin(fs.readFileSync('./NOTICE', 'utf8')),
    ],
};
