const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const resolve = (dir) => path.resolve(__dirname, '..', dir)

module.exports = {
  entry: {
    mue: ['./src/index.js'],
    example: ['./test/example.js']
  },
  output: {
    path: resolve('dist'),
    filename: '[name].bundle.js'
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
      'node_modules',
      resolve('src')
    ],
    extensions: [".js", ".json"],
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: './test/index.html'}
    ], {})
  ]
}