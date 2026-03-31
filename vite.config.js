import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and related
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          // UI libraries
          if (id.includes('framer-motion') || id.includes('react-hot-toast') || id.includes('react-dropzone')) {
            return 'vendor-ui';
          }
          // Icons - only if they actually exist
          if (id.includes('@heroicons/react') && !id.includes('empty')) {
            return 'vendor-icons';
          }
          // Charts
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          // Utilities
          if (id.includes('axios') || id.includes('date-fns') || id.includes('react-loader-spinner')) {
            return 'vendor-utils';
          }
        }
      }
    },
    minify: 'terser'
  }
})
// trigger reload