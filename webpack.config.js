var webpack = require('webpack');
var path = require('path');

var libraryName = 'zDropdown';
var env = process.env.NODE_ENV;
var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');

var plugins = [];
if (env !== 'dev') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  );
}

module.exports = {
  entry: './src/' + libraryName + '.js',

  output: {
    path: BUILD_PATH,
    filename: libraryName + '.min.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  devtool: 'source-map',

  devServer: {
    publicPath: "/dist/",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: APP_PATH,
        options: {
            presets: ['es2015']
        }
      }
    ]
  },

  plugins: plugins,
};