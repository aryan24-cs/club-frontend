import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss'; 
import autoprefixer from 'autoprefixer'; 

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  base: './', // Relative paths for assets
});