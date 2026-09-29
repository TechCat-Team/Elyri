#!/usr/bin/env node

import { createInterface } from 'node:readline/promises';

import { add, detectPackageManager, ExistingFilesError, parseArgs } from './lib.mjs';
import { components } from './manifest.mjs';

const [, , command, ...args] = process.argv;

const printUsage = () => {
  console.error('Usage: elyri add <component...> [--dir <path>] [--overwrite]');
  console.error('       elyri list');
  console.error('Run `elyri list` to see every available component.');
};

/** Ask a yes/no question. Only called when stdin is a TTY. */
const ask = async (question) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return /^y(es)?$/i.test((await rl.question(question)).trim());
  } catch {
    // Stdin closed early (Ctrl+D): treat it as declining rather than dumping a raw error.
    return false;
  } finally {
    rl.close();
  }
};

/** Group components by the package they come from, so usage never needs one long line. */
const list = () => {
  const byPackage = new Map();
  for (const [slug, { pkg }] of Object.entries(components)) {
    if (!byPackage.has(pkg)) byPackage.set(pkg, []);
    byPackage.get(pkg).push(slug);
  }

  for (const [pkg, slugs] of byPackage) {
    console.log(`${pkg} (${slugs.length})`);
    for (const slug of slugs) console.log(`  ${slug}`);
  }
};

const run = async (options) => {
  const { destination, files } = await add(options);
  for (const file of files) console.log(`Added ${file}`);
  console.log(`Import the components from your ${destination} directory.`);
};

const copy = async (rawArgs) => {
  const { names, dir, overwrite } = parseArgs(rawArgs);
  if (!names.length) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const cwd = process.cwd();
  const options = { cwd, names, registry: components, manager: detectPackageManager(cwd), dir, overwrite };

  try {
    await run(options);
  } catch (error) {
    if (!(error instanceof ExistingFilesError)) throw error;

    // Interactive terminals get a confirmation prompt; scripts must pass --overwrite.
    if (process.stdin.isTTY) {
      console.log(error.message);
      if (await ask('Overwrite these files? (y/N) ')) {
        await run({ ...options, overwrite: true });
        return;
      }
      console.error('Aborted; no files were changed.');
    } else {
      console.error(error.message);
      console.error('Pass --overwrite to replace them.');
    }
    process.exitCode = 1;
  }
};

if (command === 'list') {
  list();
} else if (command === 'add') {
  try {
    await copy(args);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
} else {
  printUsage();
  process.exitCode = 1;
}
