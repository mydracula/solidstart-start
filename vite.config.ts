import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import vercel from 'solid-start-vercel'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ChatGPT',
        lang: 'zh-cn',
        short_name: 'ChatGPT',
        background_color: '#f6f8fa',
        icons: [
          {
            src: '192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
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
