import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/snailpay': 'http://localhost:3001' },
  },
  test: {
    environment: 'jsdom',
  },
})