import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    //css预处理
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.module.scss" as *;`,
        silenceDeprecations: ['import'],
      },
    },
  },
})
