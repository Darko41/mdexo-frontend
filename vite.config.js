import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: false,  // Your existing HMR setting
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Your Spring Boot backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // Remove /api prefix when forwarding
      }
    }
  },
  base: '/',
  plugins: [react(), tailwindcss()],
});