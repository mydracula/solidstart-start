import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'
// import vercel from 'solid-start-vercel'

export default defineConfig({
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    solid({
      inspect: false,
      ssr: true
      // adapter: vercel({
      //   edge: true
      // })
    })
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './src')
    }
  }
})
