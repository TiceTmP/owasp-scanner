// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  modules: [
    'nuxt-icon',
    // '@nuxtjs/tailwindcss'
    // เพิ่ม @nuxtjs/tailwindcss หากใช้โมดูลนี้
    // หากไม่ได้ใช้ก็ไม่ต้องเพิ่ม
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  vite: {
    server: {
      hmr: false
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
    // ตัวแปรส่วนตัว (private) - เข้าถึงได้เฉพาะ server-side
    apiSecret: process.env.API_SECRET,

    // ตัวแปรสาธารณะ (public) - เข้าถึงได้ทั้ง client-side และ server-side
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000',
    }
  },
})
