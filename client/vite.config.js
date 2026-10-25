import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// usePolling: projects on FUSE/NTFS/network mounts (and some Docker volumes) don't emit
// inotify events, so without it Vite keeps serving stale modules after edits.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, watch: { usePolling: true, interval: 300 } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
