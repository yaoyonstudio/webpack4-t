const path = require('path')
const fs = require('fs')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractSCSS = new ExtractTextPlugin('css/styles.css')

const commonChunks = ['vendor', 'common']

function generatePageHtmlPlugins(templateDir, scriptDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))
  return templateFiles.map(item => {
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]

    const config = {
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
    }

    if (scriptDir) {
      const pageScriptFile = path.resolve(__dirname, scriptDir, `${name}.js`)
      try {
        if (fs.existsSync(pageScriptFile)) {
          config.chunks = commonChunks.concat([name])
        } else {
          config.chunks = commonChunks
        }
      } catch (err) {
        console.error('Err:', err)
      }
    }

    return new HtmlWebpackPlugin(config)
  })
}

const pageHtmlPlugins = generatePageHtmlPlugins('./src/pages', './src/js')

const chunks = {
  styles: ['./css/styles.scss'],
  vendor: ['./libs/vue.js', './libs/axios.js'],
  common: './js/common.js',
  index: './js/index.js',
  profile: './js/profile.js',
  about: './js/about.js'
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: chunks,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js',
  },
  module: {
    rules: [{
        test: /\.scss$/,
        use: extractSCSS.extract({
          fallback: {
            loader: 'style-loader'
          },
          use: [{
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true
              }
            },
            "resolve-url-loader", {
              loader: 'sass-loader',
              options: {
                importLoaders: 1,
                sourceMap: true
              }
            }, "postcss-loader"
          ]
        })
      },

      {
        test: '/\.js$/',
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [{
          loader: "url-loader",
          options: {
            limit: 10000,
            name: path.posix.join('assets', 'img/[name].[ext]')
          }
        }]
      }, {
        test: '/\.(png|jpg|gif)$/',
        use: [{
          loader: 'file-loader',
          options: {
            outputPath: 'imgs/',
            name: '[path][name].[ext]',
          }
        }]
      }, {
        test: '/\.html$/',
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    compress: true,
    port: 9000
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: 'img',
      to: 'img'
    }, ]),
    extractSCSS,
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: './index.html',
      chunks: commonChunks.concat(['index'])
    })
  ].concat(pageHtmlPlugins)
}