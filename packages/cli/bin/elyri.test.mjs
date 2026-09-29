import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  add,
  detectPackageManager,
  ExistingFilesError,
  parseArgs,
  resolveDestination,
  resolveSelection,
  rewriteSource,
} from './lib.mjs';
import { components } from './manifest.mjs';

const cli = fileURLToPath(new URL('./elyri.mjs', import.meta.url));

// Package name → its root directory inside this workspace
const PACKAGE_ROOT = {
  '@elyri/motion': fileURLToPath(new URL('../../motion/', import.meta.url)),
  '@elyri/ui': fileURLToPath(new URL('../../ui/', import.meta.url)),
  '@elyri/blocks': fileURLToPath(new URL('../../blocks/', import.meta.url)),
};

/** Every package the registry pulls source from */
const manifestPackages = [...new Set(Object.values(components).map((entry) => entry.pkg))];

const tempDir = () => mkdtemp(join(tmpdir(), 'elyri-cli-'));

/** Create a throwaway project and link the given source packages into its node_modules */
const createProject = async (packages) => {
  const cwd = await tempDir();
  await mkdir(join(cwd, 'src'), { recursive: true });
  for (const pkg of packages) {
    const target = join(cwd, 'node_modules', pkg);
    await mkdir(join(cwd, 'node_modules', pkg, '..'), { recursive: true });
    await symlink(PACKAGE_ROOT[pkg], target, 'dir');
  }
  return cwd;
};

const withProject = async (packages, run) => {
  const cwd = await createProject(packages);
  try {
    await run(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
};

const withTempDir = async (run) => {
  const cwd = await tempDir();
  try {
    await run(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
};

test('parseArgs separates names, dir and overwrite flags', () => {
  assert.deepEqual(parseArgs(['a', 'b']), { names: ['a', 'b'], dir: undefined, overwrite: false });
  assert.deepEqual(parseArgs(['a', '--dir', 'app/ui', '--overwrite']), {
    names: ['a'],
    dir: 'app/ui',
    overwrite: true,
  });
  assert.deepEqual(parseArgs(['a', '--dir=app/ui', '-f']), { names: ['a'], dir: 'app/ui', overwrite: true });
  assert.throws(() => parseArgs(['a', '--dir']), /needs a path/);
});

test('resolveSelection expands deps in order and rejects cycles', () => {
  const registry = {
    a: { pkg: 'p', folder: 'a', name: 'A', deps: ['b'] },
    b: { pkg: 'p', folder: 'b', name: 'B' },
    c: { pkg: 'p', folder: 'c', name: 'C', deps: ['c'] },
  };

  assert.deepEqual(
    resolveSelection(['a', 'b'], registry).map((entry) => entry.slug),
    ['b', 'a'],
  );
  assert.throws(() => resolveSelection(['c'], registry), /Circular dependency/);
  assert.throws(() => resolveSelection(['nope'], registry), /Unknown component/);
});

test('rewriteSource points the shared runtime at the package', () => {
  const source = "import { cn } from '../../core';\nimport './A.css';\n";
  assert.equal(
    rewriteSource(source, '@elyri/motion', 'A.tsx'),
    "import { cn } from '@elyri/motion/core';\nimport './A.css';\n",
  );
  // A nested file may still reference siblings inside the component folder
  const nested = "import './x.css';\nimport { y } from '../y';\n";
  assert.equal(rewriteSource(nested, '@elyri/motion', 'parts/A.tsx'), nested);
});

test('rewriteSource rejects imports that escape the component folder', () => {
  assert.throws(
    () => rewriteSource("import { useX } from '../../hooks/useX';\n", '@elyri/motion', 'A.tsx'),
    /outside the component folder/,
  );
});

test('detectPackageManager prefers the user agent and falls back to lockfiles', async () => {
  await withTempDir(async (cwd) => {
    assert.equal(detectPackageManager(cwd, ''), 'pnpm');
    await writeFile(join(cwd, 'yarn.lock'), '');
    assert.equal(detectPackageManager(cwd, ''), 'yarn');
    assert.equal(detectPackageManager(cwd, 'npm/11.0.0 node/v20'), 'npm');
  });
});

test('resolveDestination follows tsconfig aliases, src layout and --dir', async () => {
  await withTempDir(async (cwd) => {
    // Neither a src directory nor a config: fall back to components/elyri
    assert.equal(await resolveDestination(cwd), resolve(cwd, 'components/elyri'));

    await mkdir(join(cwd, 'src'), { recursive: true });
    assert.equal(await resolveDestination(cwd), resolve(cwd, 'src/components/elyri'));

    // The alias is inherited through extends, so baseUrl resolves against the declaring config
    await writeFile(join(cwd, 'tsconfig.json'), JSON.stringify({ extends: './tsconfig.base' }));
    await writeFile(
      join(cwd, 'tsconfig.base.json'),
      JSON.stringify({ compilerOptions: { paths: { react: ['./node_modules/react'], '@/*': ['./app/*'] } } }),
    );
    assert.equal(await resolveDestination(cwd), resolve(cwd, 'app/components/elyri'));

    assert.equal(await resolveDestination(cwd, 'lib/elyri'), resolve(cwd, 'lib/elyri'));
  });
});

test('add copies the whole component folder and never overwrites', async () => {
  await withProject(['@elyri/motion'], async (cwd) => {
    const { destination, files } = await add({ cwd, names: ['aurora'], registry: components, manager: 'pnpm' });
    const target = join(cwd, 'src/components/elyri/Aurora');

    assert.equal(destination, join('src', 'components', 'elyri'));
    for (const file of ['Aurora.tsx', 'Aurora.css', 'index.ts']) {
      assert.ok(
        files.some((path) => path.endsWith(`/Aurora/${file}`)),
        `${file} should be copied`,
      );
    }

    const component = await readFile(join(target, 'Aurora.tsx'), 'utf8');
    assert.match(component, /from '@elyri\/motion\/core'/);
    assert.doesNotMatch(component, /\.\.\/\.\.\/\.\.\/core/);
    assert.ok((await readFile(join(target, 'Aurora.css'), 'utf8')).length > 0);
  });
});

test('add reports every existing file and writes nothing', async () => {
  await withProject(['@elyri/motion'], async (cwd) => {
    await add({ cwd, names: ['aurora'], registry: components, manager: 'pnpm' });

    const target = join(cwd, 'src/components/elyri/Aurora/Aurora.tsx');
    await writeFile(target, 'custom content');

    await assert.rejects(add({ cwd, names: ['aurora'], registry: components, manager: 'pnpm' }), (error) => {
      assert.ok(error instanceof ExistingFilesError);
      assert.ok(error.files.some((file) => file.endsWith('/Aurora/Aurora.tsx')));
      return true;
    });
    assert.equal(await readFile(target, 'utf8'), 'custom content');
  });
});

test('add replaces existing files when overwrite is set', async () => {
  await withProject(['@elyri/motion'], async (cwd) => {
    await add({ cwd, names: ['aurora'], registry: components, manager: 'pnpm' });

    const target = join(cwd, 'src/components/elyri/Aurora/Aurora.tsx');
    await writeFile(target, 'custom content');

    await add({ cwd, names: ['aurora'], registry: components, manager: 'pnpm', overwrite: true });

    const component = await readFile(target, 'utf8');
    assert.match(component, /from '@elyri\/motion\/core'/);
    assert.doesNotMatch(component, /custom content/);
  });
});

test('add honours an explicit dir', async () => {
  await withProject(['@elyri/motion'], async (cwd) => {
    const { destination } = await add({
      cwd,
      names: ['fade-in'],
      registry: components,
      manager: 'pnpm',
      dir: 'app/ui',
    });

    assert.equal(destination, join('app', 'ui'));
    const component = await readFile(join(cwd, 'app/ui/FadeIn/FadeIn.tsx'), 'utf8');
    assert.match(component, /from '@elyri\/motion\/core'/);
  });
});

test('every registered component can be copied', async () => {
  await withProject(manifestPackages, async (cwd) => {
    await add({ cwd, names: Object.keys(components), registry: components, manager: 'pnpm' });

    for (const { name } of Object.values(components)) {
      const entry = await readFile(join(cwd, 'src/components/elyri', name, 'index.ts'), 'utf8');
      assert.match(entry, /^export /m);
    }
  });
});

test('add asks to install the matching package first', async () => {
  await withTempDir(async (cwd) => {
    await assert.rejects(
      add({ cwd, names: ['fade-in'], registry: components, manager: 'npm' }),
      /npm install @elyri\/motion/,
    );
  });
});

test('add explains when the installed package is too old', async () => {
  await withTempDir(async (cwd) => {
    const packageRoot = join(cwd, 'node_modules/@elyri/motion');
    await mkdir(join(packageRoot, 'src/components'), { recursive: true });
    await writeFile(join(packageRoot, 'package.json'), JSON.stringify({ name: '@elyri/motion', version: '0.0.1' }));

    await assert.rejects(
      add({ cwd, names: ['aurora'], registry: components, manager: 'yarn' }),
      /@elyri\/motion@0\.0\.1 does not ship backgrounds\/Aurora[\s\S]*yarn add @elyri\/motion@latest/,
    );
  });
});

test('cli lists components and reports usage on misuse', async () => {
  await withProject(['@elyri/motion'], async (cwd) => {
    const listed = execFileSync(process.execPath, [cli, 'list'], { cwd, encoding: 'utf8' });
    assert.match(listed, /@elyri\/motion/);
    assert.match(listed, /fade-in/);

    execFileSync(process.execPath, [cli, 'add', 'fade-in'], { cwd });
    const component = await readFile(join(cwd, 'src/components/elyri/FadeIn/FadeIn.tsx'), 'utf8');
    assert.match(component, /from '@elyri\/motion\/core'/);

    execFileSync(process.execPath, [cli, 'add', 'tilt', '--dir=app/ui'], { cwd });
    assert.match(await readFile(join(cwd, 'app/ui/Tilt/Tilt.tsx'), 'utf8'), /from '@elyri\/motion\/core'/);

    // stdin is a pipe here, so a conflict must fail with a hint instead of prompting
    assert.throws(() => execFileSync(process.execPath, [cli, 'add', 'fade-in'], { cwd }), /Pass --overwrite/);
    execFileSync(process.execPath, [cli, 'add', 'fade-in', '--overwrite'], { cwd });

    assert.throws(() => execFileSync(process.execPath, [cli, 'add'], { cwd }), /Usage/);
    assert.throws(() => execFileSync(process.execPath, [cli, 'add', 'nope'], { cwd }), /Unknown component/);
    assert.throws(() => execFileSync(process.execPath, [cli, 'add', 'fade-in', '--dir'], { cwd }), /needs a path/);
  });
});

test('manifest registers every component on disk', async () => {
  const onDisk = [];
  for (const [pkg, root] of Object.entries(PACKAGE_ROOT)) {
    for (const category of await readdir(join(root, 'src/components'), { withFileTypes: true })) {
      if (!category.isDirectory()) continue;
      const categoryRoot = join(root, 'src/components', category.name);
      for (const entry of await readdir(categoryRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        // A folder counts as a component once it holds a .tsx file; empty placeholders do not
        const files = await readdir(join(categoryRoot, entry.name));
        if (files.some((file) => file.endsWith('.tsx'))) onDisk.push(`${pkg}:${category.name}/${entry.name}`);
      }
    }
  }
  const registered = Object.values(components).map(({ pkg, folder }) => `${pkg}:${folder}`);
  assert.deepEqual(onDisk.sort(), registered.sort());
});

test('runtime packages publish the source the cli copies', async () => {
  for (const pkg of new Set(Object.values(components).map((entry) => entry.pkg))) {
    const manifest = JSON.parse(await readFile(join(PACKAGE_ROOT[pkg], 'package.json'), 'utf8'));
    assert.ok(manifest.files.includes('src/components'), `${pkg} must publish src/components`);
  }
});
