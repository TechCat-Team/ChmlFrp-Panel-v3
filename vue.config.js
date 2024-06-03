const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  devServer: {
    proxy: {
      '/uapi': {
        target: 'https://uapis.cn/api',
        changeOrigin: true,
        pathRewrite: { '^/uapi': '' },
      },
    },
  },
};
