import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// PUNTO DE AUDITORIA (Identify):
// Configuración del build system
// Define puertos, hosts y opciones de desarrollo

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Permite acceso desde otras dispositivos en la red
    allowedHosts: [
      'auditoria.codedbymartin.net', // Host principal del tunnel
      '.codedbymartin.net' // Todos los subdominios
    ],
    proxy: {
      // Configuración de proxy para desarrollo
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    // Opciones de build para producción
    sourcemap: true, // PUNTO DE AUDITORIA: Source maps para debugging
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantener console.logs para auditoría
      },
    },
  },
  define: {
    // Variables globales
    __APP_VERSION__: JSON.stringify('1.0.0-auditoria'),
  },
});