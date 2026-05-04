import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    
    port: 5173,
    hmr: true,

    proxy: {
      "/api": {
        target: "http://localhost:8000", // your Django port
        changeOrigin: true,
      },
  },
}
});
