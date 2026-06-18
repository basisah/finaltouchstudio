import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",      // Bind to all interfaces so Docker can expose it
    port: 3000,
    hmr: {
      clientPort: 8080,   // Must match the HOST port so browser WS connects correctly through Docker
    },
    watch: {
      usePolling: true,    // Required for file watching inside Docker on Windows/Mac
      interval: 300,
    },
    proxy: {
      // Local dev: localhost. Docker: set VITE_PROXY_TARGET=http://backend:4000
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
