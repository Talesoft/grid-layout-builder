
const {resolve} = require('path');

const common = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devtool: 'inline-source-maps',
    mode: process.env.APP_ENV || 'development',
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
};

module.exports = [
    //server
    Object.assign({}, common, {
        entry: resolve(__dirname, 'src', 'server', 'index.ts'),
        target: 'node',
        node: {
            __filename: true,
            __dirname: true
        },
        output: {
            filename: 'index.js',
            path: resolve(__dirname, 'dist', 'server')
        }
    }),

    //frontend
    Object.assign({}, common, {
        entry: resolve(__dirname, 'src', 'frontend', 'index.tsx'),
        target: 'web',
        output: {
            filename: 'index.js',
            path: resolve(__dirname, 'dist', 'frontend')
        }
    })
];
