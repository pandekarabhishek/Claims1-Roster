const path                = require('path')
const HtmlWebpackPlugin   = require('html-webpack-plugin')
const MiniCssExtractPlugin= require('mini-css-extract-plugin')
const Dotenv              = require('dotenv-webpack')

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production'

  return {
    entry: './src/index.jsx',

    output: {
      path:       path.resolve(__dirname, 'dist'),
      filename:   isProd ? '[name].[contenthash:8].js' : '[name].js',
      publicPath: '/',
      clean:      true,
    },

    resolve: {
      extensions: ['.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    module: {
      rules: [
        // JSX / JS via Babel
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: { loader: 'babel-loader' },
        },
        // CSS + Tailwind + PostCSS
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon:  './public/favicon.ico',
      }),
      ...(isProd ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' })] : []),
      new Dotenv({ systemvars: true }),   // picks up .env + Azure env vars
    ],

    devServer: {
      port:        3000,
      hot:         true,
      historyApiFallback: true,
      proxy: [
        {
          context: ['/api', '/health'],
          target:  process.env.REACT_APP_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      ],
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test:  /[\\/]node_modules[\\/]/,
            name:  'vendors',
            chunks:'all',
          },
        },
      },
    },

    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
  }
}
