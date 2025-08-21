import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 2. Adicione a opção cacheDir aqui
  // cacheDir: 'D:/vite_cache/smart-garage', 

  // --- OU de forma mais robusta (recomendado) ---
  // cacheDir: path.join('D:', 'vite_cache', 'smart-garage'),
})
