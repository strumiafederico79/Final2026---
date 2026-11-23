import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  root: resolve(__dirname),
  base: command === 'build' ? './' : '/',
  plugins: [
    {
      name: 'html-redirect',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/') {
            req.url = '/index.html';
          }
          next();
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false, // FIX B8: antes `true` → exponía 1.7MB de source map en
                      // producción. Cambiado a false. Si se necesitan para
                      // debugging, correr con `vite build --mode development`.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    proxy: (() => {
      const target = process.env.VITE_BACKEND_TARGET || 'http://127.0.0.1:8000';
      const wsTarget = target.replace(/^http/, 'ws');
      return {
        '/api': {
          target,
          ws: true,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
        '/auth': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/preview': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/jobs': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/projects': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: wsTarget,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      };
    })(),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}));
