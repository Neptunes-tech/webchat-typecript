const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');
const { BannerPlugin } = require('webpack');
var fs = require('fs');

module.exports = [
    {
        // entry: ['babel-polyfill', './index.js'],
        entry: './umd.js',
        output: {
            path: path.join(__dirname, '/lib'),
            filename: 'index.js',
            library: 'WebChat',
            libraryTarget: 'umd',
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                'react-native$': 'react-native-web',
            },
        },
        mode: 'production',
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
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(__dirname, '/static'), to: path.join(__dirname, '/lib') },
                ],
            }),
            new BannerPlugin(fs.readFileSync('./NOTICE', 'utf8')),
        ],
    },
    {
        entry: './index.js',
        externals: {
            react: {
                root: 'React',
                commonjs2: 'react',
                commonjs: 'react',
                amd: 'react',
                umd: 'react',
            },
            'react-dom': {
                root: 'ReactDOM',
                commonjs2: 'react-dom',
                commonjs: 'react-dom',
                amd: 'react-dom',
                umd: 'react-dom',
            },
        },
        output: {
            path: path.join(__dirname, '/module'),
            filename: 'index.js',
            library: 'WebChat',
            libraryTarget: 'umd',
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                'react-native$': 'react-native-web',
            },
        },
        mode: 'production',
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
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(__dirname, '/static'), to: path.join(__dirname, '/module') },
                ],
            }),
            new BannerPlugin(fs.readFileSync('./NOTICE', 'utf8')),
        ],
    },
];
