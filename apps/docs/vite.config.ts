import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const libraryRoot = fileURLToPath(new URL('../../packages/motion/src', import.meta.url));
const uiLibraryRoot = fileURLToPath(new URL('../../packages/ui/src', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@elyri\/motion\/styles\.css$/, replacement: `${libraryRoot}/styles/index.css` },
      { find: /^@elyri\/motion$/, replacement: `${libraryRoot}/index.ts` },
      { find: /^@elyri\/ui\/styles\.css$/, replacement: `${uiLibraryRoot}/styles/index.css` },
      { find: /^@elyri\/ui$/, replacement: `${uiLibraryRoot}/index.ts` },
    ],
  },
  server: {
    // 监听 0.0.0.0，允许局域网内其他设备访问
    host: true,
    fs: {
      // 允许通过 /@fs/ 直接引用仓库外的大视频做演示，避免复制进仓库
      allow: [workspaceRoot, 'E:/工作站/pdoom-video/out'],
    },
  },
});
