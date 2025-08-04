import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss"; // Use @tailwindcss/postcss

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Output directory
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), require("autoprefixer")],
    },
  },
  base: "./", // Relative paths for assets
});
