import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import vercel from "solid-start-vercel"

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
    }),
    solid({
      // inspect: false,
      ssr: true,
      adapter: vercel({
        edge: true
      })
    })
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './src')
    }
  }
})
