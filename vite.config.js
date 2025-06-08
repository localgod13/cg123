import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    watch: {
      usePolling: true,
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3001,
      clientPort: 3001,
      timeout: 30000,
      overlay: true,
      client: {
        overlay: true,
        reconnect: true
      }
    },
    cors: true,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Connection': 'Upgrade',
      'Upgrade': 'websocket',
      'Sec-WebSocket-Protocol': 'vite-hmr'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['three']
  }
}); 