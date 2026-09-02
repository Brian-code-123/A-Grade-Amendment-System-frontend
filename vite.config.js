import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// vueDevTools plugin prints extra startup messages; disable it to keep terminal clean
// import vueDevTools from 'vite-plugin-vue-devtools'




// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-pdf': ['pdf-lib', 'jspdf'],
          'vendor-ui': ['bootstrap']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost' }
    },
    globals: true,
    setupFiles: ['./src/test-setup.js']
  },
})


