import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const cli = fileURLToPath(new URL('./elyri.mjs', import.meta.url));

test('add copies editable components and never overwrites them', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'elyri-cli-'));
  try {
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ dependencies: { elyri: '^0.0.1' } }));
    const added = {
      'fade-in': 'FadeIn',
      'gradient-text': 'GradientText',
      marquee: 'Marquee',
      'dragon-scales': 'DragonScales',
      aurora: 'Aurora',
      'silk-waves': 'SilkWaves',
      caustics: 'Caustics',
      'liquid-metal': 'LiquidMetal',
      'morph-grid': 'MorphGrid',
      'ascii-image': 'AsciiImage',
      'count-up': 'CountUp',
      'scale-in': 'ScaleIn',
      'particle-text': 'ParticleText',
      'scramble-text': 'ScrambleText',
      'scroll-marquee': 'ScrollMarquee',
      'split-reveal': 'SplitReveal',
      tilt: 'Tilt',
      typewriter: 'Typewriter',
    };
    execFileSync(process.execPath, [cli, 'add', ...Object.keys(added)], { cwd });

    for (const name of Object.values(added)) {
      const component = await readFile(join(cwd, 'src/components/elyri', `${name}.tsx`), 'utf8');
      assert.match(component, /from 'elyri\/core'/);
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

test('add requires the core dependency before writing files', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'elyri-cli-'));
  try {
    await writeFile(join(cwd, 'package.json'), '{}');
    assert.throws(() => execFileSync(process.execPath, [cli, 'add', 'fade-in'], { cwd }), /Install the core package/);
    await assert.rejects(readFile(join(cwd, 'src/components/elyri/FadeIn.tsx')));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
