import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

/** The shared runtime is always imported as `<pkg>/core`, whatever depth the source used. */
const coreImport = /from\s+(['"])(?:\.\.\/)+core\1/g;
/** Any other relative import (side-effect imports and re-exports included); used to verify a copy cannot escape its folder. */
const relativeImport = /(?:from\s+|^\s*import\s+)(['"])(\.\.?\/[^'"]*)\1/gm;
/** Extensions whose imports are rewritten. */
const scriptExtensions = ['.ts', '.tsx'];
const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'];
const installCommands = { pnpm: 'pnpm add', npm: 'npm install', yarn: 'yarn add', bun: 'bun add' };

/** Fallback destination when the project has neither a source alias nor a `src/` directory. */
const defaultDestination = 'src/components/elyri';

/** Thrown when a target file already exists; `files` lists every conflicting path. */
export class ExistingFilesError extends Error {
  constructor(files) {
    super(`Already exists; no files were changed:\n${files.map((file) => `  ${file}`).join('\n')}`);
    this.name = 'ExistingFilesError';
    this.files = files;
  }
}

const isScript = (file) => scriptExtensions.some((ext) => file.endsWith(ext));

const readJson = async (file) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
};

/** Split component names from `--dir` / `--overwrite`, order independent. */
export const parseArgs = (rawArgs) => {
  const names = [];
  let dir;
  let overwrite = false;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === '--dir' || arg === '-d') {
      dir = rawArgs[index + 1];
      if (!dir) throw new Error(`${arg} needs a path`);
      index += 1;
    } else if (arg.startsWith('--dir=')) {
      dir = arg.slice('--dir='.length);
      if (!dir) throw new Error('--dir needs a path');
    } else if (arg === '--overwrite' || arg === '--force' || arg === '-f') {
      overwrite = true;
    } else {
      names.push(arg);
    }
  }

  return { names, dir, overwrite };
};

/** Detect the package manager from `npm_config_user_agent`, then lockfiles, then default to pnpm. */
export const detectPackageManager = (cwd, userAgent = process.env.npm_config_user_agent ?? '') => {
  const fromAgent = packageManagers.find((manager) => userAgent.startsWith(manager));
  if (fromAgent) return fromAgent;

  const lockfiles = [
    ['pnpm', 'pnpm-lock.yaml'],
    ['yarn', 'yarn.lock'],
    ['bun', 'bun.lockb'],
    ['bun', 'bun.lock'],
    ['npm', 'package-lock.json'],
  ];
  return lockfiles.find(([, lockfile]) => existsSync(join(cwd, lockfile)))?.[0] ?? 'pnpm';
};

/** Install command for a package, so errors suggest something that works in the user's setup. */
const installCommand = (manager, pkg) => `${installCommands[manager] ?? installCommands.pnpm} ${pkg}`;

/** Only these alias keys are treated as the project source root, so `react`-style mappings are ignored. */
const aliasKeys = ['@/*', '~/*', '#/*'];
const configFiles = ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json'];

/** Walk `extends` to the first config that declares `paths`, keeping the file that declared them. */
const findPathsConfig = async (file, seen = new Set()) => {
  const full = resolve(file);
  if (seen.has(full)) return null;
  seen.add(full);

  const json = await readJson(full);
  if (!json) return null;
  if (json.compilerOptions?.paths) {
    return {
      paths: json.compilerOptions.paths,
      baseUrl: json.compilerOptions.baseUrl ?? '.',
      dir: dirname(full),
    };
  }
  if (typeof json.extends === 'string' && json.extends.startsWith('.')) {
    const next = json.extends.endsWith('.json') ? json.extends : `${json.extends}.json`;
    return findPathsConfig(resolve(dirname(full), next), seen);
  }
  return null;
};

/** Infer the source root from a tsconfig alias, e.g. "@/*": ["./src/*"] → <cwd>/src. */
const findAliasRoot = async (cwd) => {
  for (const configFile of configFiles) {
    const found = await findPathsConfig(join(cwd, configFile));
    if (!found) continue;

    for (const key of aliasKeys) {
      const [target] = Array.isArray(found.paths[key]) ? found.paths[key] : [];
      if (typeof target !== 'string') continue;
      const root = target.replace(/\*.*$/, '').replace(/\/+$/, '');
      if (!root) continue;
      return resolve(found.dir, found.baseUrl, root);
    }
  }
  return null;
};

/** Copy target: `--dir` wins, then the tsconfig source alias, then the usual layout with or without `src/`. */
export const resolveDestination = async (cwd, dir) => {
  if (dir) return resolve(cwd, dir);

  const aliasRoot = await findAliasRoot(cwd);
  if (aliasRoot) return join(aliasRoot, 'components', 'elyri');

  return resolve(cwd, existsSync(join(cwd, 'src')) ? defaultDestination : 'components/elyri');
};

/** Expand `deps` recursively, keeping declaration order, de-duplicating and rejecting cycles. */
export const resolveSelection = (names, registry) => {
  const selection = [];
  const visiting = new Set();
  const resolved = new Set();

  const visit = (slug) => {
    if (resolved.has(slug)) return;
    const entry = registry[slug];
    if (!entry) throw new Error(`Unknown component: ${slug}`);
    if (visiting.has(slug)) throw new Error(`Circular dependency: ${slug}`);

    visiting.add(slug);
    for (const dep of entry.deps ?? []) visit(dep);
    visiting.delete(slug);
    resolved.add(slug);
    selection.push({ slug, ...entry });
  };

  for (const name of new Set(names)) visit(name);
  return selection;
};

/** Every file inside a component folder, as `/`-separated paths relative to it. */
const collectFiles = async (componentRoot) => {
  const files = [];

  const walk = async (dir) => {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      if (item.name.startsWith('.')) continue;
      const full = join(dir, item.name);
      if (item.isDirectory()) await walk(full);
      else files.push(relative(componentRoot, full).split(sep).join('/'));
    }
  };

  await walk(componentRoot);
  return files.sort();
};

/**
 * Rewrite one source file so the shared runtime is imported from the package.
 * Relative imports that would still escape the component folder are an error:
 * copying them would produce a file that cannot resolve its own imports.
 */
export const rewriteSource = (source, pkg, file) => {
  const depth = file.split('/').length - 1;
  const rewritten = source.replace(coreImport, (_match, quote) => `from ${quote}${pkg}/core${quote}`);

  const escaping = new Set();
  for (const [, , specifier] of rewritten.matchAll(relativeImport)) {
    const prefix = /^(?:\.\.\/)+/.exec(specifier)?.[0] ?? '';
    const up = prefix ? prefix.split('../').length - 1 : 0;
    if (up > depth) escaping.add(specifier);
  }
  if (escaping.size) {
    throw new Error(`${file} imports outside the component folder: ${[...escaping].join(', ')}`);
  }

  return rewritten;
};

/**
 * Copy component source into the user's project. A component is copied as a whole
 * folder (including its index.ts), so relative imports inside it keep working;
 * only the shared runtime is rewritten to `<pkg>/core`.
 */
export const add = async ({ cwd, names, registry, manager = 'pnpm', dir, overwrite = false }) => {
  const selection = resolveSelection(names, registry);
  const destination = await resolveDestination(cwd, dir);

  // 1. Read everything into memory first: a failure here must not leave a half-written copy.
  const pending = [];
  for (const entry of selection) {
    const packageRoot = resolve(cwd, 'node_modules', entry.pkg);
    const sourceRoot = join(packageRoot, 'src/components');
    if (!existsSync(sourceRoot)) {
      throw new Error(`Missing ${entry.pkg}. Install it first: ${installCommand(manager, entry.pkg)}`);
    }

    const componentRoot = join(sourceRoot, entry.folder);
    if (!existsSync(componentRoot)) {
      // The package is installed but does not ship this component: usually a stale version.
      const version = (await readJson(join(packageRoot, 'package.json')))?.version ?? 'unknown';
      throw new Error(
        `${entry.pkg}@${version} does not ship ${entry.folder}. Update it first: ${installCommand(manager, `${entry.pkg}@latest`)}`,
      );
    }

    const files = await collectFiles(componentRoot);
    if (!files.length) throw new Error(`${entry.pkg} ships no files for ${entry.slug}`);

    for (const file of files) {
      const from = join(componentRoot, file);
      const source = await readFile(from, 'utf8');
      pending.push({
        from,
        to: join(destination, entry.name, file),
        content: isScript(file) ? rewriteSource(source, entry.pkg, file) : source,
      });
    }
  }

  // 2. Pre-check conflicts: an existing file, or two components writing the same path.
  const seen = new Set();
  const conflicts = new Set();
  for (const { to } of pending) {
    if (seen.has(to) || existsSync(to)) conflicts.add(to);
    seen.add(to);
  }
  if (conflicts.size && !overwrite) throw new ExistingFilesError([...conflicts]);

  // 3. Only write once every pre-check passed.
  for (const { to, content } of pending) {
    await mkdir(dirname(to), { recursive: true });
    // `wx` never clobbers a file created between the pre-check and the write.
    await writeFile(to, content, { flag: overwrite ? 'w' : 'wx' });
  }

  return { destination: relative(cwd, destination) || '.', files: pending.map(({ to }) => to) };
};
