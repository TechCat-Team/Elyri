#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const components = {
  'ascii-image': { folder: 'media/AsciiImage', name: 'AsciiImage' },
  aurora: { folder: 'backgrounds/Aurora', name: 'Aurora' },
  caustics: { folder: 'backgrounds/Caustics', name: 'Caustics' },
  'count-up': { folder: 'animations/CountUp', name: 'CountUp' },
  'dragon-scales': { folder: 'backgrounds/DragonScales', name: 'DragonScales' },
  'fade-in': { folder: 'animations/FadeIn', name: 'FadeIn' },
  'gradient-text': { folder: 'text/GradientText', name: 'GradientText' },
  marquee: { folder: 'text/Marquee', name: 'Marquee' },
  'morph-grid': { folder: 'backgrounds/MorphGrid', name: 'MorphGrid' },
  'particle-text': { folder: 'text/ParticleText', name: 'ParticleText' },
  'pixel-vortex': { folder: 'backgrounds/PixelVortex', name: 'PixelVortex' },
  'scale-in': { folder: 'animations/ScaleIn', name: 'ScaleIn' },
  'scramble-text': { folder: 'text/ScrambleText', name: 'ScrambleText' },
  'scroll-marquee': { folder: 'text/ScrollMarquee', name: 'ScrollMarquee' },
  'silk-waves': { folder: 'backgrounds/SilkWaves', name: 'SilkWaves' },
  'split-reveal': { folder: 'text/SplitReveal', name: 'SplitReveal' },
  tilt: { folder: 'animations/Tilt', name: 'Tilt' },
  typewriter: { folder: 'text/Typewriter', name: 'Typewriter' },
};

const available = Object.keys(components);

// 组件源码里的共享运行时统一由 `elyri/core` 提供，拷贝时改写成包名导入。
// 用正则而非字面量匹配，避免引号或换行变化导致改写静默失效。
const coreImport = /from\s+['"](?:\.\.\/)+core['"]/g;
const leftoverCoreImport = /from\s+['"](?:\.\.\/)+core['"]/;

const rewriteCoreImport = (source, from) => {
  const rewritten = source.replace(coreImport, "from 'elyri/core'");
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
    if (!manifest.dependencies?.elyri && !manifest.devDependencies?.elyri) {
      throw new Error('Install the core package first: pnpm add elyri');
    }

    const sourceRoot = fileURLToPath(new URL('../src/components/', import.meta.url));
    const destinations = [...new Set(names)].flatMap((name) => {
      const { folder, name: component } = components[name];
      return ['tsx', 'css'].map((ext) => ({
        from: join(sourceRoot, folder, `${component}.${ext}`),
        to: resolve(cwd, 'src/components/elyri', `${component}.${ext}`),
      }));
    });

    const existing = destinations.filter(({ to }) => existsSync(to));
    if (existing.length) {
      throw new Error(`Already exists; no files were changed:\n${existing.map(({ to }) => `  ${to}`).join('\n')}`);
    }

    for (const { from, to } of destinations) {
      const source = await readFile(from, 'utf8');
      const content = from.endsWith('.tsx') ? rewriteCoreImport(source, from) : source;
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
