import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    allowedHosts: [
      '10.60.174.187:8089',
      'bf0b-110-137-192-103.ngrok-free.app',
      'nd-pupils-aruba-logs.trycloudflare.com',
      'frequent-probably-leads-consisting.trycloudflare.com'
    ]
  }
});
