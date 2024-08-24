// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';


const stylesHandler = 'style-loader';



const config = {
    entry: './js-src/index.ts',
    output: {
        path: path.resolve(__dirname, '_static'),
        filename: 'javascript-components.js'
    },
    externals: {
        pyodide: '{loadPyodide: (...args) => loadPyodide(...args)}', // This will exclude "pyodide" from the bundle...loadPyodide might load after the bundled code so create a shim
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
        // Copy files pyodide.js will load asynchronously
        new CopyPlugin({
            patterns: ["python_stdlib.zip", "pyodide.asm.wasm", "pyodide-lock.json", "pyodide.asm.js",
                // "hashlib-1.0.0.zip", "openssl-1.1.1n.zip", "lzma-1.0.0.zip", "pydecimal-1.0.0.zip", "pydoc_data-1.0.0.zip", "sqlite3-1.0.0.zip", "ssl-1.0.0.zip"
            ].map(f => ({ from: require.resolve(`pyodide/${f}`), to: `pyodide/${f}` }))
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                exclude: ['/node_modules/'],
                use: [{
                    loader: 'ts-loader'
                }, {
                    options: {
                        dest: 'ext/component-spec.json'
                    },
                    loader: './component-spec-loader'
                }]
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [stylesHandler, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    stats: 'errors-only'
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
