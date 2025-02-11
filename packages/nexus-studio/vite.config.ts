import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5000,
  },
  build: {
    outDir: './public/',
  },
});
