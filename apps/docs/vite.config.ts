import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const libraryRoot = fileURLToPath(new URL('../../packages/elyri/src', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^elyri\/styles\.css$/, replacement: `${libraryRoot}/styles/index.css` },
      { find: /^elyri$/, replacement: `${libraryRoot}/index.ts` },
    ],
  },
  server: {
    fs: {
      // 允许通过 /@fs/ 直接引用仓库外的大视频做演示，避免复制进仓库
      allow: [workspaceRoot, 'E:/工作站/pdoom-video/out'],
    },
  },
});
