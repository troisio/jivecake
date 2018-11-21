const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function() {
  return {
    target: 'node',
    externals: [nodeExternals()],
    entry: [
      '@babel/polyfill',
      path.resolve(__dirname, 'server/index.js')
    ],
    output: {
      path: path.resolve(__dirname, 'server-dist'),
      filename: 'server.js',
      library: '',
      libraryTarget: 'commonjs2'
    },
    resolve: {
      alias: {
        api: path.resolve(__dirname, 'server/api'),
        common: path.resolve(__dirname, 'common'),
        database: path.resolve(__dirname, 'server/database'),
        route: path.resolve(__dirname, 'server/route'),
        router: path.resolve(__dirname, 'server/router'),
        extra: path.resolve(__dirname, 'extra'),
        settings: path.resolve(__dirname, 'server/settings'),
        packageJson: path.resolve(__dirname, 'package.json'),
      },
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /((jwt\.key)|(jwt\.key\.pub))$/,
          use: 'raw-loader'
        },
        {
          test: /(\.jsx?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-react'],
                plugins: [
                  '@babel/plugin-proposal-class-properties',
                  '@babel/plugin-transform-regenerator'
                ]
              }
            },
            {
              loader: 'eslint-loader',
              options: {
                rules: {
                  'no-console': 0
                },
                parserOptions: {
                  ecmaVersion: 8,
                  sourceType: 'module',
                  ecmaFeatures: {
                    modules: true,
                    classes: true,
                    experimentalObjectRestSpread: true
                  }
                },
                globals: [
                  'require',
                  'module',
                  'console',
                  '__dirname',
                  'Promise',
                ],
                baseConfig: {
                  extends: ['eslint:recommended']
                }
              }
            }
          ]
        }
      ]
    }
  };
};
