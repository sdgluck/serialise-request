'use strict'

var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'serialise-request.min.js',
    library: 'serialiseRequest',
    libraryTarget: 'umd'
  },
  plugins: [new webpack.optimize.UglifyJsPlugin],
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loaders: [
        'babel?' + JSON.stringify(
          {
            presets: [
              'es2015',
              'stage-0'
            ]
          }
        )
      ]
    }]
  }
}
