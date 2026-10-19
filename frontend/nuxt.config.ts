// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  app: {
    head: {
      title: 'KBTC Web',
      htmlAttrs: { lang: 'th' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      // เปลี่ยนตอน deploy ได้ด้วย env: NUXT_PUBLIC_API_BASE / NUXT_PUBLIC_FILE_BASE
      apiBase: 'http://127.0.0.1:5000/api',
      fileBase: 'http://127.0.0.1:5000'
    }
  }
})
