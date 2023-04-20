import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': "http://127.0.0.1:5276/",
      "/r": {
        target: "http://127.0.0.1:5276/",
        ws: true,
      }
    }
    // proxy: {
    //   '/api': "https://caring-library-production.up.railway.app/",
    //   "/r": {
    //     target: "https://caring-library-production.up.railway.app/",
    //     ws: true,
    //   }
    // }
  },
  plugins: [react()],
})
