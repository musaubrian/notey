// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  routeRules: {
    "/*": { ssr: false }, // render all of it client side
    "/notes": { ssr: false },
    "/notes/*": { ssr: false },
  },
});
