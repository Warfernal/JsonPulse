import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    open: false,
    preTransformRequests: false,
    watch: {
      usePolling: true,
      interval: 100
    },
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    include: [
      'zustand',
      'use-sync-external-store',
      'use-sync-external-store/shim/with-selector'
    ]
  }
})
