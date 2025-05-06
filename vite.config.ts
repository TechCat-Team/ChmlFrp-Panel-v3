// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path';

export default defineConfig({
  root: process.cwd(), // 明确设置项目根目录
  base: '/', // 确保基础路径正确
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173, // 明确端口
    strictPort: true, // 禁止端口自动切换
    open: true // 自动打开浏览器
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
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 添加这行
    },
  },
  build: {
    sourcemap: false, // 等效于 productionSourceMap: false
    minify: 'terser', // 默认使用 esbuild，显式声明使用 terser
    terserOptions: {
      format: {
        comments: false
      },
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 200, // 等效于 maxSize: 200000 (单位 KB)
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            const match = id.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)
            if (match) {
              return `npm.${match[1].replace('@', '')}`
            }
            return 'npm.vendors' // 默认 node_modules 模块归类
          }
          return 'shared' // 非 node_modules 的统一 chunk
        }
      }
    }
  }
})