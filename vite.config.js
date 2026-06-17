import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Detect if running in GitHub Actions (deploying to GitHub Pages)
const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

// https://vite.dev/config/
export default defineConfig({
  base: isGithubPages ? '/SmartAttend---Attendance-Management-System/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

