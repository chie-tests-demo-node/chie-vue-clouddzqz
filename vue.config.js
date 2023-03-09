const {
  defineConfig
} = require('@vue/cli-service')
module.exports = defineConfig({
  pwa: {
    iconPaths: {
      favicon32: 'swxa-logo-icon.png',
      favicon16: 'swxa-logo-icon.png',
      appleTouchIcon: 'swxa-logo-icon.png',
      maskIcon: 'swxa-logo-icon.png',
      msTileImage: 'swxa-logo-icon.png',
      androidChrome: 'swxa-logo-icon.png'
    }
  },
  transpileDependencies: true,
  productionSourceMap: false,
  lintOnSave: false,
  chainWebpack(config) {
    const oneOfsMap = config.module.rule('scss').oneOfs.store
    oneOfsMap.forEach((item) => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          resources: './src/theme/common.scss' //相对路径
        })
        .end()
    })
  },
  configureWebpack: {
    performance: {
      hints: 'warning',
      //入口起点的最大体积 整数类型（以字节为单位）
      maxEntrypointSize: 50000000,
      //生成文件的最大体积 整数类型（以字节为单位 300k）
      maxAssetSize: 30000000,
      //只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js');
      }
    }
  },
  devServer: {
    open: process.env.NODE_ENV !== 'production',
    proxy: {
      '/sign': {
        // target: 'http://192.168.100.205:8888',
        target: 'http://192.168.0.163:8888',
        // target: 'http://192.168.100.157:8888',
        changeOrigin: true,
        pathRewrite: {
          '^/sign': ''
        },
      },
    }
  },
})