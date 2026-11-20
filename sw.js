'use strict';

// Keep the scope in both prefixes. GitHub Pages projects can share an origin.
const scope = self.registration.scope;
const prefix = 'dailykit-' + scope + '-';
const legacyPrefix = 'shutter-lab-' + scope + '-';
const cacheName = prefix + 'v11';
const files = ['./', './index.html', './shutter-angle-calculator.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const localFiles = new Set(files.map(file => new URL(file, scope).pathname));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(files.map(file => new Request(new URL(file, scope), {cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => (key.startsWith(prefix) || key.startsWith(legacyPrefix)) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !localFiles.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(event.request, {ignoreSearch:true}) || fetch(event.request);
  })());
});
