import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/backend": {
        target: "http://localhost", // Apache do XAMPP
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, "/backend"),
      },
    },
  },
});
