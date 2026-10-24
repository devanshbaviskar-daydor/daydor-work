import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // With VITE_DATA_SOURCE=http the screens call /api; in development vite forwards it to the API when VITE_API_PROXY is set
  // (scripts/dev_stack.sh in the backend repo sets it).
  const proxy = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_PROXY

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: proxy ? { proxy: { '/api': { target: proxy, changeOrigin: true } } } : {},
  }
})
