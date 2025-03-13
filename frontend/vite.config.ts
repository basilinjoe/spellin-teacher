import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
}

export default defineConfig(config)