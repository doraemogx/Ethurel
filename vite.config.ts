import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Base relativa: funciona tanto em localhost (raiz) quanto publicado sob um
// subcaminho (GitHub Pages de projeto, ex.: /Ethurel/), sem precisar de config
// condicional por ambiente.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
});
