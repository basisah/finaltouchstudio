import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Inside Docker the backend is reachable as `backend:4000` and the browser talks
// to Vite through the host port 8080. Both can be overridden for a bare-metal run:
//   VITE_PROXY_TARGET=http://localhost:4000 VITE_HMR_CLIENT_PORT=3000 npm run dev
const proxyTarget = process.env.VITE_PROXY_TARGET || "http://backend:4000";
const hmrClientPort = Number(process.env.VITE_HMR_CLIENT_PORT) || 8080;
const proxied = { target: proxyTarget, changeOrigin: true };

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    hmr: { clientPort: hmrClientPort },
    watch: {
      usePolling: true, // required for file watching inside Docker on Windows/Mac
      interval: 300,
    },
    proxy: {
      "/api": proxied,
      "/uploads": proxied,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
