#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { components } from './manifest.mjs';

const available = Object.keys(components);

// 组件源码里的共享运行时统一由 `<pkg>/core` 提供，拷贝时改写成包名导入。
// 用正则而非字面量匹配，避免引号或换行变化导致改写静默失效。
const coreImport = /from\s+['"](?:\.\.\/)+core['"]/g;
const leftoverCoreImport = /from\s+['"](?:\.\.\/)+core['"]/;

const rewriteCoreImport = (source, pkg, from) => {
  const rewritten = source.replace(coreImport, `from '${pkg}/core'`);
  if (leftoverCoreImport.test(rewritten)) {
    throw new Error(`Could not rewrite the shared runtime import in ${from}`);
  }
  return rewritten;
};

const [, , command, ...names] = process.argv;

if (command !== 'add' || names.length === 0 || names.some((name) => !components[name])) {
  console.error(`Usage: elyri add <${available.join('|')}> [component...]`);
  process.exitCode = 1;
} else {
  try {
    const cwd = process.cwd();
    const manifest = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'));

    const selected = [...new Set(names)].map((name) => components[name]);
    // 拷贝后的源码从 <pkg>/core 导入运行时，对应包必须在用户项目的依赖里
    const missing = [...new Set(selected.map(({ pkg }) => pkg))].filter(
      (pkg) => !manifest.dependencies?.[pkg] && !manifest.devDependencies?.[pkg],
    );
    if (missing.length) {
      throw new Error(`Install the source package first: pnpm add ${missing.join(' ')}`);
    }

    const destinations = selected.flatMap(({ pkg, folder, name: component }) => {
      const sourceRoot = resolve(cwd, 'node_modules', pkg, 'src/components');
      return ['tsx', 'css'].map((ext) => ({
        pkg,
        from: join(sourceRoot, folder, `${component}.${ext}`),
        to: resolve(cwd, 'src/components/elyri', `${component}.${ext}`),
      }));
    });

    const existing = destinations.filter(({ to }) => existsSync(to));
    if (existing.length) {
      throw new Error(`Already exists; no files were changed:\n${existing.map(({ to }) => `  ${to}`).join('\n')}`);
    }

    for (const { pkg, from, to } of destinations) {
      const source = await readFile(from, 'utf8');
      const content = from.endsWith('.tsx') ? rewriteCoreImport(source, pkg, from) : source;
      await mkdir(dirname(to), { recursive: true });
      await writeFile(to, content, { flag: 'wx' });
      console.log(`Added ${to}`);
    }
    console.log('Import the components from your src/components/elyri directory.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
