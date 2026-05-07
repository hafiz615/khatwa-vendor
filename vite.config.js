import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/business/',
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '5174', 10),
  },
})
