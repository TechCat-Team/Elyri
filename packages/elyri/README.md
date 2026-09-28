# elyri

React 动效组件库，零运行时依赖，使用 CSS 变量做主题定制。

## 安装

```bash
pnpm add elyri
```

## 使用

```tsx
import { FadeIn, GradientText } from 'elyri';
import 'elyri/styles.css';

export function Hero() {
  return (
    <FadeIn direction="up" delay={100}>
      <GradientText colors={['#6d5cff', '#22d3ee']}>Elyri</GradientText>
    </FadeIn>
  );
}
```

## 主题

所有可定制项都是 CSS 变量，定义在 `:root` 上即可全局覆盖，也可以只写在某个容器内做局部覆盖。

```css
:root {
  --elyri-duration-base: 500ms;
  --elyri-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## 组件

| 组件           | 分类        | 说明                                     |
| -------------- | ----------- | ---------------------------------------- |
| `GradientText` | text        | 渐变文字，支持自定义配色与流动动画       |
| `FadeIn`       | animations  | 进入视口时淡入位移                       |
| `DragonScales` | backgrounds | WebGL 龙鳞动态背景，光源跟随指针         |
| `Aurora`       | backgrounds | WebGL 极光夜空，多层光帘与星空           |
| `SilkWaves`    | backgrounds | WebGL 流动丝绸，缎面光泽                 |
| `Caustics`     | backgrounds | WebGL 水下焦散光网，指针荡开水波         |
| `LiquidMetal`  | backgrounds | WebGL 液态铬面，彩虹薄膜，指针处液面鼓起 |

## Hooks

| Hook / Provider           | 说明                                        |
| ------------------------- | ------------------------------------------- |
| `usePrefersReducedMotion` | 读取系统「减弱动态效果」偏好                |
| `ReducedMotionProvider`   | 强制某棵子树播放 / 静止，优先级高于系统偏好 |

## License

MIT
