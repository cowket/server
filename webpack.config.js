const TerserPlugin = require('terser-webpack-plugin')

module.exports = function (options) {
  return {
    ...options,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({})]
    }
  }
}
