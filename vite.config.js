import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        design: resolve(import.meta.dirname, 'design.html'),
        video: resolve(import.meta.dirname, 'video.html'),
        websiteDesign: resolve(import.meta.dirname, 'website-design.html'),
        amazonStoreDesign: resolve(import.meta.dirname, 'amazon-store-design.html'),
        detailPageDesign: resolve(import.meta.dirname, 'detail-page-design.html'),
        commercialDesign: resolve(import.meta.dirname, 'commercial-design.html'),
        viDesign: resolve(import.meta.dirname, 'vi-design.html'),
      },
    },
  },
})
