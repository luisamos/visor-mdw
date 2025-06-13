export default {
  optimizeDeps: {
    include: ['ol'],
  },
  build: {
    sourcemap: true,
    manifest: true,
    chunkSizeWarningLimit: 100000,       
  },
  preview: {
    port: 81,
  },
  define: {
    global: 'globalThis'
  },
  server: {
    cors: true,
    port: 81,
  }
}