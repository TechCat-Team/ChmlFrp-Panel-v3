const { defineConfig } = require('@vue/cli-service');
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
      '/v1': {
        target: 'https://v1-api.chmlfrp.cn',
        changeOrigin: true,
        pathRewrite: { '^/v1api': '' },
      },
      '/v2': {
        target: 'https://v2-api.chmlfrp.cn',
        changeOrigin: true,
        pathRewrite: { '^/v2api': '' },
      },
    },
  },
});
