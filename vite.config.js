import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // CodeMirror is intentionally lazy-loaded as an isolated editor bundle.
    chunkSizeWarningLimit: 700,
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
  },
});
