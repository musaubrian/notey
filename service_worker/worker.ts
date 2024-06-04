///// <reference lib="WebWorker" />
///// <reference types="vite/client" />
//import {
//  cleanupOutdatedCaches,
//  createHandlerBoundToURL,
//  precacheAndRoute,
//} from "workbox-precaching";
//import { clientsClaim } from "workbox-core";
//import { NavigationRoute, registerRoute } from "workbox-routing";
//
//declare let self: ServiceWorkerGlobalScope;
//
//// self.__WB_MANIFEST is default injection point
//precacheAndRoute(self.__WB_MANIFEST);
//
//// clean old assets
//cleanupOutdatedCaches();
//
//let allowlist: undefined | RegExp[];
//allowlist = [/^\/$/];
//
//// to allow work offline
//registerRoute(new NavigationRoute(createHandlerBoundToURL("/"), { allowlist }));
//
//self.skipWaiting();
//clientsClaim();

/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        maxEntries: 30,
      }),
    ],
  })
);

// Precache app shell and critical assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Register navigation routes for offline fallback
const allowlist = [/.*/];
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/"), { allowlist })
);

// Use CacheFirst strategy for static resources
registerRoute(
  /\.(?:js|css|html|png|svg|ico)$/, // Cache all static resources
  new CacheFirst({
    cacheName: "static-resources",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);


self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  clientsClaim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function updateContentCache() {
  const cache = await caches.open('static-resources');
  const resources = self.__WB_MANIFEST.map((resource) => resource.url);
  await cache.addAll(resources);
}

// Periodic Sync event listener
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContentCache());
  }
});

// Polling mechanism to update cache every 24 hours
self.addEventListener('periodicupdate', (event) => {
  if (navigator.onLine) {
    event.waitUntil(updateContentCache());
  }
});
