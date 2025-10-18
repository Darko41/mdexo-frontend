import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync } from "fs";
import { join } from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  base: '/',
  plugins: [
    react(), 
    tailwindcss(),
    // Plugin to create _redirects file during build
    {
      name: 'generate-redirects',
      apply: 'build',
      closeBundle: {
        order: 'post',
        handler() {
          try {
            const redirectsContent = `/*    /index.html   200`;
            const outputPath = join(__dirname, 'dist', '_redirects');
            writeFileSync(outputPath, redirectsContent);
            console.log('✅ _redirects file created successfully at:', outputPath);
          } catch (error) {
            console.error('❌ Failed to create _redirects file:', error);
          }
        }
      }
    }
  ],
});