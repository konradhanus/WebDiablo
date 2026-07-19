// WebDiablo Service Worker — offline-capable PWA
const VERSION = 'wd-v3.4.0';
const CACHE = VERSION + '-cache';

// Core app shell + game assets to precache on install.
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/three.module.js',
  './vendor/jsm/loaders/GLTFLoader.js',
  './vendor/jsm/utils/BufferGeometryUtils.js',
  './vendor/models/soldier.glb',
  './vendor/models/xbot.glb',
  './vendor/models/robot.glb',
  './vendor/models/michelle.glb',
  './vendor/models/flamingo.glb',
  './vendor/models/parrot.glb',
  './vendor/models/stork.glb',
  './vendor/models/horse.glb',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/mask-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Strategy:
//  - navigation requests -> network-first, fallback to cached index.html (offline)
//  - everything else      -> cache-first, then network (populate cache)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && url.protocol.startsWith('http')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
