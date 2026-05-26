import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("element-plus")) {
            return "element-plus";
          }

          if (id.includes("/vue/") || id.includes("@vue")) {
            return "vue-vendor";
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
