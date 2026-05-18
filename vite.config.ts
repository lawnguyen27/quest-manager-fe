import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    proxy: {
      // Spring SockJS: /ws, /ws/info, /ws/... — HTTP + WebSocket upgrade
      '/ws': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true,
      },
      // Native STOMP endpoint (if you ever use brokerURL ws://…/ws-stomp from dev)
      '/ws-stomp': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
