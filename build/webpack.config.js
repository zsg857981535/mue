const path = require('path')

const resolve = (dir) => path.resolve(__dirname, '..', dir)

module.exports = {
  entry: './index.js',
  output: {
    path: resolve('dist'),
    filename: 'mue.bundle.js'
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          fix: true,
          formatter: require("eslint-friendly-formatter"),
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  resolve: {
    modules: [
      'node_moduels',
      resolve('src')
    ],
    extensions: [".js", ".json"],
  }
}