// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'path';

export default defineConfig({
    root: process.cwd(),
    base: '/',
    server: {
        host: '0.0.0.0',
        port: 5174,
        strictPort: true,
        open: true,
    },
    plugins: [
        vue(),
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
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            format: {
                comments: false,
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        // 针对特定依赖进行分组
                        if (id.includes('naive-ui')) {
                            return 'vendor-naive-ui';
                        }
                        if (id.includes('echarts')) {
                            return 'vendor-echarts';
                        }
                        if (id.includes('three')) {
                            return 'vendor-three';
                        }
                        if (id.includes('lodash') || id.includes('axios') || id.includes('dayjs')) {
                            return 'vendor-utils';
                        }
                        return 'vendors';
                    }
                    return 'shared';
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            },
        },
    },
});
