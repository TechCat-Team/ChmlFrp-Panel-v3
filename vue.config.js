const { defineConfig } = require('@vue/cli-service');
const Components = require('unplugin-vue-components/webpack').default;
const { NaiveUiResolver } = require('unplugin-vue-components/resolvers');
const AutoImport = require('unplugin-auto-import/webpack').default;

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      Components({
        resolvers: [NaiveUiResolver()],
      }),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': [
              'useMessage',
              'useLoadingBar',
              'lightTheme',
              'darkTheme',
              'useDialog',
              'useNotification'
            ]
          }
        ],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),
    ],
  },
});