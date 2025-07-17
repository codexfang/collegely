import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/collegely/',  // <-- your GitHub repo name here with slash
  plugins: [react()],
})