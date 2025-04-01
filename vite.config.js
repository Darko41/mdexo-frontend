import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: false,  // Disable HMR temporarily to check if WebSocket is causing the issue
  },
  base: '/',
  plugins: [react(), tailwindcss()],
});


