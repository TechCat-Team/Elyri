import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  // 组件依赖 hooks / context / portal，属客户端代码；注入指令让 RSC 环境可直接引用。
  // 不能开启 treeshake：它的 rollup 二次打包会把 'use client' 指令当普通表达式丢掉。
  banner: { js: "'use client';" },
});
