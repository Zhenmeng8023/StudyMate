import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("pdfjs-dist") || id.includes("react-pdf")) {
            return "pdf-reader";
          }

          if (id.includes("@tiptap")) {
            return "editor";
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("scheduler")
          ) {
            return "react-stack";
          }

          return "vendor";
        }
      }
    }
  },
  server: {
    proxy: {
      "/api": process.env.VITE_API_PROXY ?? "http://localhost:8023"
    }
  }
});
