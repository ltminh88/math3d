import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon-180x180.png', 'icons/favicon.ico'],
      manifest: {
        // Keep in sync with src/i18n/common-strings.ts (the only duplicated copy of the name).
        name: 'Hành Trình Đá Số',
        short_name: 'Đá Số',
        description: 'Trò chơi học phép nhân và phép chia cho bé 7-9 tuổi.',
        lang: 'vi',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#fdf6e3',
        theme_color: '#3a7d44',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
