const { defineConfig } = require('@vue/cli-service');
const Components = require('unplugin-vue-components/webpack').default;
const { NaiveUiResolver } = require('unplugin-vue-components/resolvers');
const AutoImport = require('unplugin-auto-import/webpack').default;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = defineConfig({
    transpileDependencies: true,
    productionSourceMap: false, // 禁用 Source Map
    configureWebpack: {
        optimization: {
            minimize: true, // 启用压缩
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: false, // 移除注释
                        },
                        compress: {
                            drop_console: true, // 移除 console.log
                            drop_debugger: true, // 移除 debugger
                        },
                    },
                    extractComments: false, // 不生成单独的注释文件
                }),
            ],
            splitChunks: {
                chunks: 'all',
                // 控制文件大小
                maxSize: 200000,
                minSize: 20000,
                automaticNameDelimiter: '-',
                // 异步请求控制
                maxAsyncRequests: 10,
                maxInitialRequests: 5,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        name(module) {
                            // 确保 module.context 存在并且路径包含 node_modules
                            if (
                                module.context &&
                                module.context.includes('node_modules')
                            ) {
                                const match = module.context.match(
                                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                                );
                                if (match) {
                                    const packageName = match[1];
                                    return `npm.${packageName.replace(
                                        '@',
                                        ''
                                    )}`;
                                }
                            }
                            // 如果不在 node_modules 中，直接返回 null 跳过处理
                            return null;
                        },
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
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
                            'useNotification',
                        ],
                    },
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
