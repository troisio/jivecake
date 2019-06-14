const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const packageJson = require(path.resolve(__dirname, 'package.json'));

module.exports = function() {
  return {
    entry: [
      /*
        deprecated
        https://babeljs.io/docs/en/babel-polyfill
      */
      '@babel/polyfill',
      path.resolve(__dirname, 'web/js/index.jsx'),
      path.resolve(__dirname, 'web/sass/index.scss'),
    ],
    output: {
      path: path.resolve(__dirname, 'web-dist'),
      filename: `[name]-${packageJson.version}.js`
    },
    plugins: [
      new HtmlWebpackPlugin({
        version: packageJson.version,
        template: path.resolve(__dirname, 'web/index-template.html'),
        inject: false
      }),
      new MiniCssExtractPlugin({
        filename: `index-${packageJson.version}.css`
      })
    ],
    resolve: {
      alias: {
        settings: path.resolve(__dirname, 'web/settings'),
        component: path.resolve(__dirname, 'web/js/component'),
        page: path.resolve(__dirname, 'web/js/page'),
        js: path.resolve(__dirname, 'web/js'),
        common: path.resolve(__dirname, 'common'),
        sass: path.resolve(__dirname, 'web/sass')
      },
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /(\.scss)$/,
          use: [{
            loader: MiniCssExtractPlugin.loader,
          }, {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          }, {
            loader: 'sass-loader'
          }]
        },
        {
          test: /(\.jsx?)$/,
          exclude: /node_modules/,
          use: [
            { loader: 'babel-loader' },
            { loader: 'eslint-loader' }
          ]
        }
      ]
    }
  };
};
