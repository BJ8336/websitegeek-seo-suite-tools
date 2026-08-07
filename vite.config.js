import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Subfolder deployment on shared cPanel hosting (InterServer):
// https://websitegeek.net/seo-tools/
export default defineConfig({
  base: '/seo-tools/',
  plugins: [react(), tailwindcss()],
})
