import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Confirm output directory
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  base: './', // ⬅️ very important
})
