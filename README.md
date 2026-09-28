# Elyri

[![npm version](https://img.shields.io/npm/v/elyri.svg)](https://www.npmjs.com/package/elyri)
[![license](https://img.shields.io/npm/l/elyri.svg)](./LICENSE)

A set of animation components for React. Each component is lightweight, fully typed, and themed through CSS variables, so it integrates into an existing design system without introducing a runtime style engine.

[docs](https://www.elyri.dev) · [npm](https://www.npmjs.com/package/elyri) · [GitHub](https://github.com/TechCat-Team/Elyri)

## Features

- Theming through CSS variables, with no runtime style engine
- Honors the `prefers-reduced-motion` user preference by default
- TypeScript definitions included
- Supports React 18 and 19

## Installation

```bash
pnpm add elyri
```

Import the stylesheet once at your application entry point:

```ts
import 'elyri/styles.css';
```

## Usage

```tsx
import { FadeIn, GradientText } from 'elyri';

export function Hero() {
  return (
    <FadeIn direction="up" delay={100}>
      <GradientText colors={['#a78bfa', '#7c3aed']} animated>
        Hello from Elyri
      </GradientText>
    </FadeIn>
  );
}
```

## Components

| Component       | Category    | Description                                             |
| --------------- | ----------- | ------------------------------------------------------- |
| `FadeIn`        | Animations  | Fades and slides content in when it enters the viewport |
| `ScaleIn`       | Animations  | Scales and fades content in when it enters the viewport |
| `CountUp`       | Animations  | Counts a number up to its target when it enters view    |
| `Tilt`          | Animations  | Tilts content in 3D following the pointer               |
| `DragonScales`  | Backgrounds | WebGL dragon-scale background with interactive lighting |
| `Aurora`        | Backgrounds | WebGL aurora night sky with layered curtains and stars  |
| `SilkWaves`     | Backgrounds | WebGL flowing silk with satin sheen                     |
| `Caustics`      | Backgrounds | WebGL underwater caustics with pointer ripples          |
| `MorphGrid`     | Backgrounds | WebGL grid cycling between circles, squares and crosses |
| `GradientText`  | Text        | Applies an animated gradient to text                    |
| `SplitReveal`   | Text        | Reveals text character by character as it enters view   |
| `Typewriter`    | Text        | Types text out with a blinking cursor                   |
| `ScrambleText`  | Text        | Decodes text from glowing scrambled glyphs              |
| `ParticleText`  | Text        | Text made of particles that scatter from the pointer    |
| `ScrollMarquee` | Text        | Slides text horizontally as the page scrolls vertically |

## Requirements

- React 18 or 19 (`react` and `react-dom` are peer dependencies)
- A bundler that supports CSS imports (Vite, webpack, Next.js, and others)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the repository layout, development commands, and instructions for adding a component.

## License

MIT © 轻爪科技. See [LICENSE](./LICENSE).
