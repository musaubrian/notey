/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();
const networkFirstHandler = new NetworkFirst({ cacheName: "notey-navigation-cache" })

const allowlist = [/^\/$/];
registerRoute(new NavigationRoute(networkFirstHandler, { allowlist }));

self.skipWaiting();
clientsClaim();

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open('notey-dynamic-cache');
        cache.put(event.request, networkResponse.clone());

        return networkResponse;
      } catch (error) {
        // If the network request fails, try to serve the resource from the cache
        const cache = await caches.open('notey-dynamic-cache');
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        } else {
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        }
      }
    })()
  );
});
