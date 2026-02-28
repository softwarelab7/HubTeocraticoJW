import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Generar archivo de versión para evadir caché
  const versionPath = path.resolve(__dirname, 'public/version.json');
  if (!fs.existsSync(path.resolve(__dirname, 'public'))) {
    fs.mkdirSync(path.resolve(__dirname, 'public'));
  }
  fs.writeFileSync(versionPath, JSON.stringify({ version: Date.now().toString() }));

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    base: './', // Ensures assets are loaded correctly on GitHub Pages
    build: {
      outDir: 'docs',
    },
  };
});
