import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The site is served from the custom domain https://funkydirtmusic.com/,
  // so assets and canonical URLs use the root path.
  base: '/',
  server: {
    allowedHosts: ['clemmie-unsurfeited-contactually.ngrok-free.dev'],
  },
})
