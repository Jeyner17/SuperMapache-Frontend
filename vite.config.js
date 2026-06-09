import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI / icons
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          // Charts
          'vendor-charts': ['recharts'],
          // HTTP + utils
          'vendor-http': ['axios', 'dompurify'],
          // Módulos de la app
          'mod-dashboard': [
            './src/modules/dashboard/pages/Dashboard.jsx',
          ],
          'mod-inventario': [
            './src/modules/inventario/pages/Inventario.jsx',
          ],
          'mod-compras': [
            './src/modules/compras/pages/Compras.jsx',
          ],
          'mod-ventas': [
            './src/modules/ventas/pages/HistorialVentas.jsx',
          ],
          'mod-pos': [
            './src/modules/ventas/pages/POS.jsx',
          ],
          'mod-reportes': [
            './src/modules/reportes/pages/Reportes.jsx',
          ],
          'mod-caja': [
            './src/modules/caja/pages/Caja.jsx',
          ],
          'mod-creditos': [
            './src/modules/creditos/pages/Creditos.jsx',
          ],
          'mod-auditoria': [
            './src/modules/auditoria/pages/Auditoria.jsx',
          ],
        },
      },
    },
  },
})