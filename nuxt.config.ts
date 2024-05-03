// https://nuxt.com/docs/api/configuration/nuxt-config
import process from "node:process";

const sw = process.env.SW === "true";
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],
  experimental: {
    payloadExtraction: true,
    watcher: "parcel",
  },
  pwa: {
    strategies: sw ? "injectManifest" : "generateSW",
    srcDir: sw ? "worker" : undefined,
    filename: sw ? "sw.ts" : undefined,
    registerType: "autoUpdate",

    manifest: {
      name: "Notey",
      short_name: "Notey",
      background_color: "#171717",
      theme_color: "#171717",
      description:
        "Craft your notes with the assuraty that it stays on your device",
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
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
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
