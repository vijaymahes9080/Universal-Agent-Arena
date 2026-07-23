import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment at:
  // https://vijaymahes9080.github.io/Universal-Agent-Arena/
  base: '/Universal-Agent-Arena/',
})
