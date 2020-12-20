const path = require('path')

module.exports = {
    mode: process.env.NODE_ENV,
    target: "node",
    stats: 'errors-only',
    entry: path.join(__dirname,  'src', 'index.ts'),
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'index.bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.wasm', '.mjs', '.js', '.json'],
    },
    module: {
        rules: [ 
          {
            loader: 'babel-loader',
            test: /\.(ts)?$/,
            exclude: /node_modules/,
            include: path.resolve(__dirname, 'src'),
        }]
    }
}
