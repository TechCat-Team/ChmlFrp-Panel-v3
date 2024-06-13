const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    open: true,
    proxy: {
      '/uapi': {
        target: 'https://uapis.cn/api',
        changeOrigin: true,
        pathRewrite: { '^/uapi': '' },
      },
    },
  },
})