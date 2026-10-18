import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      // No service worker registration until phase 18; the manifest is still emitted.
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'icons/icon.svg',
        'icons/apple-touch-icon-180x180.png',
        'icons/favicon.ico',
      ],
      manifest: {
        // Keep in sync with src/i18n/common-strings.ts (the only duplicated copy of the name).
        name: 'Math AI Game 3D – Vương Quốc Cửu Chương',
        short_name: 'Cửu Chương',
        description:
          'Math AI Game 3D - Vương Quốc Cửu Chương, game 3D giúp trẻ học phép nhân qua phiêu lưu và nhiệm vụ xây cầu.',
        lang: 'vi',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#fffcf0',
        theme_color: '#194f42',
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
  // The recovered game is one ~575 kB module graph (three + app), like the original bundle.
  // esbuild CSS minify like the original build: lightningcss drops `backdrop-filter` when a
  // `-webkit-backdrop-filter` follows it (recovered CSS order), which kills the glass blur.
  build: { chunkSizeWarningLimit: 700, cssMinify: 'esbuild' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
  },
});
