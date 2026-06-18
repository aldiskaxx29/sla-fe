import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // base: '/devqosmo/',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://10.60.174.187:8089",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/qosmo": {
        target: "https://qosmo.telkom.co.id",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/qosmo/, ""),
      },
      "/daily-monitoring-api": {
        target: "http://10.60.174.188:8089",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/daily-monitoring-api/, ""),
      },
    },
    allowedHosts: [
      '10.60.174.187:8089',
      'bf0b-110-137-192-103.ngrok-free.app',
      'nd-pupils-aruba-logs.trycloudflare.com',
      'frequent-probably-leads-consisting.trycloudflare.com'
    ]
  }
});
