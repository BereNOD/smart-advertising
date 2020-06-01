/* eslint-disable */

const webpack = require("webpack");
const path = require("path");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const config = require("./src/config.json");
const { version, ..._package } = require("./package.json");
const env = process.env.NODE_ENV || "development";
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const WebpackNotifierPlugin = require('webpack-notifier')
console.log('Envinronment:', env);
console.log('Configs:', typeof config, config);
const { resolve } = path;
const fs = require('fs');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const DashboardPlugin = require("webpack-dashboard/plugin");

const plugins = [
  new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
  new LodashModuleReplacementPlugin(),
  new BundleAnalyzerPlugin({
    analyzerMode: env === 'production' ? "static" : "disabled",
    openAnalyzer: false,
    reportFilename: path.resolve(__dirname, "report.html")
  }),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    // filename: '[name].css',
    // chunkFilename: '[id].css',
  }),
  new webpack.DefinePlugin(JSON.stringify(config)),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery'
  }),
  new webpack.HotModuleReplacementPlugin({
    requestTimeout: 15000
  }),
  new WebpackNotifierPlugin({
    title: 'Webpack',
    alwaysNotify: true
  }),
  // new DashboardPlugin()
];

const webpackConfig = {
  mode: env,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js?hash=[hash]",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel", "eslint"],
        exclude: /node_modules/,
      },
      {
        test: /\.(pug|jade)$/,
        use: [
          {
            loader: "file",
            options: {
              name: "[name].html",
            },
          },
          "extract",
          "raw",
          {
            loader: "pug-html",
            options: {
              data: {
                version,
                _package,
                config,
                env,
                fs,
                path,
                require
              },
              htmlLoader: {
                minimize: false,
              },
              pretty: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css",
            options: {
              importLoaders: 1,
            },
          },
          "postcss",
        ],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
          "postcss",
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.s(a|c)ss$/,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          // options: {
          //   publicPath: (resourcePath, context) => {
          //     return path.relative(path.dirname(resourcePath), context) + '/';
          //   },
          // },
        }, "css", "sass"],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|otf|svg|gif)$/i,
        use: [
          {
            loader: "file",
            options: {
              name: "[ext]/[name].[ext]?hash=[contenthash]"
            }
          }
        ]
      }
    ],
  },
  watch: 'development' === env,
  resolve: {
    mainFiles: ['index'],
    extensions: ['.jade', '.sass', '.scss', '.js', '.json'],
    modules: [
      resolve('src'),
      resolve('node_modules')
    ]
  },
  resolveLoader: {
    moduleExtensions: [ '-loader' ]
  },
  devtool: env === 'development'? 'source-map': false,
  plugins,
  optimization: {
    minimize: env === 'production',
    minimizer: [
      new OptimizeCSSAssetsPlugin({}),
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false,
          },
        },
      })
    ],
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};


module.exports = [{
  name: 'CORE',
  entry: "./src/index.js",
  ...webpackConfig
}, {
  name: 'FONTS',
  entry: {
    fonts: "./src/fonts/index.js"
  },
  ...webpackConfig
}];
