# Contributing

English · [简体中文](./CONTRIBUTING.zh-CN.md)

Elyri is a pnpm workspace containing four packages under `packages/`, plus the documentation site (`apps/docs`). The packages are kept separate so each can be published to npm independently.

## Repository layout

```
.
├── apps/
│   └── docs/                     # documentation site (Vite + React)
├── packages/
│   ├── cli/                      # `elyri` — copies component source into a project
│   ├── motion/                   # `@elyri/motion` — animation, background and text effects
│   ├── ui/                       # `@elyri/ui` — UI primitives (scaffolded)
│   └── blocks/                   # `@elyri/blocks` — copy-and-own page sections (scaffolded)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## packages/motion

```
src/
├── components/
│   ├── animations/               # grouped by category
│   │   ├── FadeIn/
│   │   └── index.ts
│   ├── text/
│   │   ├── GradientText/
│   │   └── index.ts
│   └── index.ts                  # aggregates all categories
├── hooks/
├── styles/
├── utils/
└── index.ts                      # library entry point
```

Each component resides in its own directory and consists of three files: the component, its stylesheet, and an `index.ts` that re-exports it.

To add a component:

1. Create a directory under `packages/motion/src/components/<category>/`, for example `GlowButton/`.
2. Add `GlowButton.tsx`, `GlowButton.css`, and `index.ts` to it.
3. Export the component from the category's `index.ts`. `components/index.ts` picks up the category automatically, so the library entry point requires no changes.

## apps/docs

```
src/
├── App.tsx                       # route dispatch
├── main.tsx                      # entry point
├── components/                   # reusable UI: Header, Sidebar, CodeBlock, ColorPicker, ...
├── pages/
│   └── ComponentPage.tsx         # a single component page
├── content/                      # documentation data and demos
│   ├── registry.ts               # collects all component docs
│   ├── guides.tsx                # introduction and installation pages
│   └── components/
│       └── fade-in/
│           ├── doc.tsx           # doc definition and copy
│           ├── FadeInDemo.tsx    # live demo, lazy-loaded
│           └── index.ts
├── lib/                          # hooks, utilities, i18n
└── styles/                       # CSS split by area
```

Conventions:

- Each documented component has a directory under `content/components/<slug>/` containing `doc.tsx`, a demo component, and an `index.ts`.
- `doc.tsx` exports a factory `<name>Doc(lang)` that returns a `ComponentDoc`. Copy for both languages is defined in a local `copy` object within the same file.
- Demo components use default exports and are loaded with `React.lazy`, so each becomes a separate chunk.
- To expose a new component in the documentation, create its directory and register its doc in `getDocs` in `content/registry.ts`. The sidebar, search, and previous/next navigation are derived from this list.
- Text shared across the site is defined in `lib/messages.ts`. Copy specific to a component remains alongside that component.
- `components/` and `pages/` do not import from `content/`. Content may use components; the reverse is not permitted.

## Commands

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `pnpm install`    | Install all dependencies              |
| `pnpm dev`        | Start the documentation site          |
| `pnpm build`      | Build every package under `packages/` |
| `pnpm build:docs` | Build the documentation site          |
| `pnpm typecheck`  | Type-check every package              |
| `pnpm lint`       | Lint with ESLint                      |
| `pnpm format`     | Format with Prettier                  |

## Publishing

```bash
pnpm build
pnpm -r --filter "./packages/*" publish --access public
```
