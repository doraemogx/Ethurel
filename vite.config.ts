import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  // Base relativa: funciona tanto em localhost (raiz) quanto publicado sob um
  // subcaminho (GitHub Pages de projeto, ex.: /Ethurel/), sem precisar de config
  // condicional por ambiente.
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
});
