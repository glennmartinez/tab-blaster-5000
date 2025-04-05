import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    // Ensure assets are copied to the correct location
    assetsInlineLimit: 0,
    // Don't minify for better debugging in development
    minify: process.env.NODE_ENV === "production",
  },
  // Base path for assets
  base: "./",
});
