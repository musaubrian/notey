import process from "node:process";

const sw = process.env.SW === "true";

export default defineNuxtConfig({
  devtools: { enabled: false },
  app: {
    head: {
      title: "Notey",
      script: [{
        "data-domain": "notey.nabri.xyz",
        defer: true,
        src: "http://plausible-i4swcws.164.90.226.112.sslip.io:8000/js/script.js"
      }]
    },
  },
  modules: ["@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],
  experimental: {
    payloadExtraction: true,
    watcher: "parcel",
  },
  pwa: {
    strategies: sw ? "injectManifest" : "generateSW",
    srcDir: sw ? "service_worker" : undefined,
    filename: sw ? "worker.ts" : undefined,
    registerType: "autoUpdate",

    manifest: {
      name: "Notey",
      short_name: "Notey",
      background_color: "#171717",
      theme_color: "#171717",
      description: "Craft your notes with the assuraty that it stays on your device",
      display: "standalone",
      start_url: "/notes",
      shortcuts: [
        {
          name: "new note",
          short_name: "new",
          url: "/notes/new",
          description: "Create a new note",
        },
      ],
      icons: [
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font',
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-resources',
          },
        },
        {
          urlPattern: /\/api\/.*\/*.json/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
          },
        },
      ],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: "/",
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },
  routeRules: {
    "/*": { ssr: false }, // render all of it client side
    "/notes/*": { ssr: false },
  },
});
