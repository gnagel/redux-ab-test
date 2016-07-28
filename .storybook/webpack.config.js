require('babel-polyfill');
var path       = require('path');
var webpack    = require('webpack'); // eslint-disable-line

const webpackConfig = {
  context: path.resolve(__dirname, '../'),
  module:  {},
  resolve: {
    extensions:         ['', '.js', '.jsx', '.json'],
    modulesDirectories: ['src', 'node_modules'],
  }
};

module.exports = webpackConfig;
