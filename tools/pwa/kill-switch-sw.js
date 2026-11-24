// Service-worker kill switch (phase 18 / TASK R22).
//
// NOT DEPLOYED and never shipped: this file lives in tools/ so it never lands in
// dist/ or public/. It exists for one emergency only — a bad service worker that
// must be removed from every device that installed it.
//
// How to use (see docs/deployment-guide.md "Kill-switch"):
//   1. Deploy this file AS /sw.js (a one-off Vercel deployment whose only file at
//      the root is this script, same origin and scope as the game).
//   2. Every visit installs it, it unregisters itself, deletes every cache, and
//      reloads the page once. The next load has no service worker at all.
//   3. Deploy the normal build again to put the good worker back (or leave the
//      game worker-less until a fixed build is ready).
//
// The worker unregisters itself, so after step 2 no service worker remains: the
// kill-switch file must NOT stay deployed, or nothing will ever install a worker
// again while it is served as /sw.js.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })(),
  );
});
