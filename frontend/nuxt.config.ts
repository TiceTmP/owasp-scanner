// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  modules: [
    'nuxt-icon',
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      }
    }
  },
  ssr: true,
  nitro: {
    experimental: {
      wasm: true
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  runtimeConfig: {
    apiSecret: process.env.API_SECRET,
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000',
    }
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  }
})
