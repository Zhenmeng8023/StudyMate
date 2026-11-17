import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);
// Resolve from react-pdf: its API, text-layer styles and worker are a versioned set.
const pdfJsRoot = dirname(require.resolve("pdfjs-dist/package.json", {
  paths: [dirname(require.resolve("react-pdf"))]
}));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^pdfjs-dist(?=\/|$)/, replacement: pdfJsRoot }]
  },
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
