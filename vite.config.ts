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
        name: 'math3d – Vương Quốc Cửu Chương',
        short_name: 'math3d',
        description:
          'math3d - Vương Quốc Cửu Chương, game 3D giúp trẻ học phép nhân qua phiêu lưu và nhiệm vụ xây cầu.',
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
        // English audio clips (Phase 2C) are lazy-loaded, never precached:
        // ~2.5 MB of mp3 would bloat every first load. The ignore is belt
        // and braces — globPatterns has no mp3 today, but a later pattern
        // change must not silently precache the clips.
        globIgnores: ['english-audio/**'],
        // A played clip works offline: CacheFirst on first play, served
        // from the cache afterwards. Clips are immutable (the hash in the
        // file name changes when the text, voice or speed change), so no expiry.
        runtimeCaching: [
          {
            urlPattern: /\/english-audio\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'english-audio',
              expiration: { maxEntries: 500 },
            },
          },
        ],
        navigateFallback: 'index.html',
        // The update prompt relies on this: when the user taps "Tải lại", the
        // waiting worker activates, and only a claiming worker takes control of
        // the open page — without it no controllerchange fires, workbox-window
        // never reloads, and the toast's reload button leaves the old build
        // on screen. skipWaiting stays off: activation happens only via the
        // prompt, so the claim never swaps a build under a playing child.
        clientsClaim: true,
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
