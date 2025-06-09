import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({ // Removed 'command'
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Add other plugins here, for example:
    // (command === 'serve' && someDevelopmentPlugin()),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: { // Add preview server configuration
    host: '0.0.0.0', // Listen on all IPv4 addresses
    port: 4173,      // Default preview port, can be kept or changed
  },
}));
