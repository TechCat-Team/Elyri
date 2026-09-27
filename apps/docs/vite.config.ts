import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const libraryRoot = fileURLToPath(new URL('../../packages/elyri/src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^elyri\/styles\.css$/, replacement: `${libraryRoot}/styles/index.css` },
      { find: /^elyri$/, replacement: `${libraryRoot}/index.ts` },
    ],
  },
});
