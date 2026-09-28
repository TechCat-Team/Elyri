# Elyri

[![npm version](https://img.shields.io/npm/v/elyri.svg)](https://www.npmjs.com/package/elyri)
[![license](https://img.shields.io/npm/l/elyri.svg)](./LICENSE)

[English](./README.md) · 简体中文

面向 React 的动效组件集合。组件保持轻量、自带 TypeScript 类型，并通过 CSS 变量实现主题化，可接入现有设计体系，且不引入运行时样式引擎。

[文档](https://www.elyri.dev) · [npm](https://www.npmjs.com/package/elyri) · [GitHub](https://github.com/TechCat-Team/Elyri)

## 特性

- 基于 CSS 变量实现主题化，无运行时样式引擎
- 默认遵循系统的 `prefers-reduced-motion` 偏好
- 内置 TypeScript 类型定义
- 同时支持 React 18 与 19

## 安装

```bash
pnpm add elyri
```

在应用入口处引入一次样式：

```ts
import 'elyri/styles.css';
```

## 使用

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

## 组件

| 组件            | 分类        | 说明                                       |
| --------------- | ----------- | ------------------------------------------ |
| `FadeIn`        | Animations  | 元素进入视口时淡入并位移                   |
| `ScaleIn`       | Animations  | 元素进入视口时缩放并淡入                   |
| `CountUp`       | Animations  | 数字进入视口时滚动到目标值                 |
| `Tilt`          | Animations  | 内容跟随指针做 3D 倾斜                     |
| `DragonScales`  | Backgrounds | WebGL 龙鳞动态背景，光源跟随指针           |
| `Aurora`        | Backgrounds | WebGL 极光夜空，多层光帘与星空             |
| `SilkWaves`     | Backgrounds | WebGL 流动丝绸，缎面光泽                   |
| `Caustics`      | Backgrounds | WebGL 水下焦散光网，指针荡开水波           |
| `MorphGrid`     | Backgrounds | WebGL 网格图形在圆形、方形、十字间循环变换 |
| `GradientText`  | Text        | 为文字应用动态渐变                         |
| `SplitReveal`   | Text        | 文本进入视口时逐字或逐词错峰浮现           |
| `Typewriter`    | Text        | 打字机效果逐字输出，带闪烁光标             |
| `ScrambleText`  | Text        | 文字从发光乱码逐字解码定格                 |
| `ParticleText`  | Text        | 粒子聚合成字，指针靠近时推散回弹           |
| `ScrollMarquee` | Text        | 页面滚动时文字横向滚动，多行反向           |
| `Marquee`       | Text        | 内容自动无限循环滚动，支持任意方向与反向   |
| `AsciiImage`    | Media       | 图片转换为 ASCII 字符画，解码式显现        |

## 环境要求

- React 18 或 19（`react`、`react-dom` 为 peer 依赖）
- 支持 CSS 引入的打包器（Vite、webpack、Next.js 等）

## 贡献

仓库结构、开发命令以及新增组件的流程，详见 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)。

## 许可证

MIT © 轻爪科技，详见 [LICENSE](./LICENSE)。
