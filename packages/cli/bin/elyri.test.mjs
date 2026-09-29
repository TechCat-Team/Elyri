import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { components } from './manifest.mjs';

const cli = fileURLToPath(new URL('./elyri.mjs', import.meta.url));

// 注册表里的包名 → 工作区内对应的包根目录
const PACKAGE_ROOT = {
  '@elyri/motion': fileURLToPath(new URL('../../motion/', import.meta.url)),
  '@elyri/ui': fileURLToPath(new URL('../../ui/', import.meta.url)),
  '@elyri/blocks': fileURLToPath(new URL('../../blocks/', import.meta.url)),
};

/** 建一个临时项目，把指定源码包链接进它的 node_modules */
const createProject = async (packages) => {
  const cwd = await mkdtemp(join(tmpdir(), 'elyri-cli-'));
  const dependencies = Object.fromEntries(packages.map((pkg) => [pkg, '*']));
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ dependencies }));
  for (const pkg of packages) {
    const target = join(cwd, 'node_modules', pkg);
    await mkdir(join(cwd, 'node_modules', pkg, '..'), { recursive: true });
    await symlink(PACKAGE_ROOT[pkg], target, 'dir');
  }
  return cwd;
};

test('add copies editable components and never overwrites them', async () => {
  const cwd = await createProject(['@elyri/motion']);
  try {
    // 派生自共享清单，避免测试再抄一份组件表
    const added = Object.fromEntries(Object.entries(components).map(([slug, { name }]) => [slug, name]));
    execFileSync(process.execPath, [cli, 'add', ...Object.keys(added)], { cwd });

    for (const name of Object.values(added)) {
      const component = await readFile(join(cwd, 'src/components/elyri', `${name}.tsx`), 'utf8');
      assert.match(component, /from '@elyri\/motion\/core'/);
      assert.doesNotMatch(component, /from '\.\.\/\.\.\/\.\.\/core'/);
      assert.ok((await readFile(join(cwd, 'src/components/elyri', `${name}.css`), 'utf8')).length > 0);
    }

    const target = join(cwd, 'src/components/elyri/FadeIn.tsx');
    await writeFile(target, 'custom content');
    assert.throws(() => execFileSync(process.execPath, [cli, 'add', 'fade-in'], { cwd }), /Already exists/);
    assert.equal(await readFile(target, 'utf8'), 'custom content');
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('manifest registers every component on disk', async () => {
  const onDisk = [];
  for (const [pkg, root] of Object.entries(PACKAGE_ROOT)) {
    for (const category of await readdir(join(root, 'src/components'), { withFileTypes: true })) {
      if (!category.isDirectory()) continue;
      const categoryRoot = join(root, 'src/components', category.name);
      for (const entry of await readdir(categoryRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        // 以 .tsx 判定组件目录，尚未动工的空占位目录不算组件
        const files = await readdir(join(categoryRoot, entry.name));
        if (files.some((file) => file.endsWith('.tsx'))) onDisk.push(`${pkg}:${category.name}/${entry.name}`);
      }
    }
  }
  const registered = Object.values(components).map(({ pkg, folder }) => `${pkg}:${folder}`);
  assert.deepEqual(onDisk.sort(), registered.sort());
});

test('add requires the source package before writing files', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'elyri-cli-'));
  try {
    await writeFile(join(cwd, 'package.json'), '{}');
    assert.throws(() => execFileSync(process.execPath, [cli, 'add', 'fade-in'], { cwd }), /Install the source package/);
    await assert.rejects(readFile(join(cwd, 'src/components/elyri/FadeIn.tsx')));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
