# 参与贡献

[English](./CONTRIBUTING.md) · 简体中文

Elyri 是一个 pnpm workspace，`packages/` 下包含四个包，另有文档站（`apps/docs`）。各包彼此独立，因此可以分别发布至 npm。

## 仓库结构

```
.
├── apps/
│   └── docs/                     # 文档站（Vite + React）
├── packages/
│   ├── cli/                      # `elyri` —— 把组件源码拷进项目
│   ├── motion/                   # `@elyri/motion` —— 动效、背景与文字效果
│   ├── ui/                       # `@elyri/ui` —— UI 基础组件（骨架）
│   └── blocks/                   # `@elyri/blocks` —— 可拷走自有的页面区块（骨架）
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## packages/motion

```
src/
├── components/
│   ├── animations/               # 按分类归档
│   │   ├── FadeIn/
│   │   └── index.ts
│   ├── text/
│   │   ├── GradientText/
│   │   └── index.ts
│   └── index.ts                  # 聚合所有分类
├── hooks/
├── styles/
├── utils/
└── index.ts                      # 库入口
```

每个组件位于独立目录，由三个文件组成：组件、样式表，以及负责导出的 `index.ts`。

新增组件：

1. 在 `packages/motion/src/components/<分类>/` 下创建组件目录，例如 `GlowButton/`。
2. 目录内添加 `GlowButton.tsx`、`GlowButton.css` 与 `index.ts`。
3. 在该分类的 `index.ts` 中导出组件。`components/index.ts` 会自动聚合分类，库入口无需改动。

## apps/docs

```
src/
├── App.tsx                       # 路由分发
├── main.tsx                      # 入口
├── components/                   # 通用 UI：Header、Sidebar、CodeBlock、ColorPicker 等
├── pages/
│   └── ComponentPage.tsx         # 单个组件页
├── content/                      # 文档数据与演示
│   ├── registry.ts               # 汇总所有组件文档
│   ├── guides.tsx                # 引导页与安装页
│   └── components/
│       └── fade-in/
│           ├── doc.tsx           # 文档定义与文案
│           ├── FadeInDemo.tsx    # 实时演示，懒加载
│           └── index.ts
├── lib/                          # hooks、工具、i18n
└── styles/                       # 按区域拆分的 CSS
```

约定：

- 每个需要展示的组件在 `content/components/<slug>/` 下创建目录，包含 `doc.tsx`、演示组件与 `index.ts`。
- `doc.tsx` 导出工厂函数 `<name>Doc(lang)`，返回 `ComponentDoc`。中英文文案定义在同文件的 `copy` 对象中。
- 演示组件采用默认导出，并通过 `React.lazy` 加载，每个演示会被拆分为独立的 chunk。
- 新增组件时，除创建目录外，还需将其 doc 注册到 `content/registry.ts` 的 `getDocs`。侧边栏、搜索以及上一页/下一页导航均由此列表生成。
- 站点通用文案定义在 `lib/messages.ts`，组件自身的文案保留在组件目录内。
- `components/` 与 `pages/` 不引用 `content/`；`content/` 可以引用组件，反向不可。

## 命令

| 命令              | 说明                        |
| ----------------- | --------------------------- |
| `pnpm install`    | 安装全部依赖                |
| `pnpm dev`        | 启动文档站                  |
| `pnpm build`      | 构建 `packages/` 下的所有包 |
| `pnpm build:docs` | 构建文档站                  |
| `pnpm typecheck`  | 全量类型检查                |
| `pnpm lint`       | 用 ESLint 检查              |
| `pnpm format`     | 用 Prettier 格式化          |

## 发布

```bash
pnpm build
pnpm -r --filter "./packages/*" publish --access public
```
