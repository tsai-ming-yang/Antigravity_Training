import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Set base path for GitHub Pages deployment
    base: mode === 'production' ? '/Antigravity_Training/' : '/',
  }
})
