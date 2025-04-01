import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Configuración base
  const config = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3001,
      open: true,
    },
    build: {
      sourcemap: true
    },
    css: {
      postcss: {
        plugins: []
      }
    }
  };
  
  // Configuración específica para desarrollo
  if (mode === 'development') {
    config.server.proxy = {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      }
    };
  }
  
  return config;
});
