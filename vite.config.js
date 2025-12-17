import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,         // Permite usar describe, it, expect sin importarlas
    environment: 'jsdom',  // Simula un navegador para renderizar componentes Vue
    include: ['tests/**/*.test.js'], // Archivos de test
    exclude: [...configDefaults.exclude] // Mantener exclusiones por defecto
  }
})
