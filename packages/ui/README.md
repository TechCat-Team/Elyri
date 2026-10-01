# @elyri/ui

React 组件库，零运行时依赖，使用 CSS 变量做主题定制，内置无障碍与键盘交互。

> 组件依赖 hooks / context / portal，属客户端代码。构建产物已带 `'use client'` 指令，可在 RSC（Next.js App Router）中直接引用。

## 安装

```bash
pnpm add @elyri/ui
```

## 使用

组件样式随包发布，需要在应用入口引入一次：

```tsx
import { Button, Dialog, ToastProvider } from '@elyri/ui';
import '@elyri/ui/styles.css';

export function App() {
  return (
    <ToastProvider>
      <Button>保存</Button>
    </ToastProvider>
  );
}
```

## 主题

所有可定制项都是 CSS 变量，覆盖在 `:root` 上即可全局换肤，也可只在某个容器内做局部覆盖。

暗色支持两种来源：

- 跟随系统：`@media (prefers-color-scheme: dark)`；
- 显式指定：`<html data-theme="dark">`（优先级更高，`data-theme="light"` 可强制浅色）。

```css
:root {
  --elyri-ui-accent: #6d5bd0;
  --elyri-ui-radius: 10px;
  --elyri-ui-z-tooltip: 80; /* 浮层层级也走令牌，便于与宿主协调 */
}
```

## 组件

| 组件           | 分类        | 说明                                                     |
| -------------- | ----------- | -------------------------------------------------------- |
| `Button`       | forms       | 四种样式、三档尺寸，内置加载态                           |
| `Input`        | forms       | 三档尺寸，支持校验失败态                                 |
| `Switch`       | forms       | 受控 / 非受控双支持，`role="switch"`                     |
| `Alert`        | feedback    | 四种语义配色，可带标题、图标、操作与关闭按钮             |
| `Progress`     | feedback    | 确定 / 不确定两种形态，四档语义配色                      |
| `Toast`        | feedback    | `ToastProvider` + `useToast`，支持 promise 与堆叠        |
| `Badge`        | data-display | 状态、标签与计数                                        |
| `Card`         | data-display | 容器 + 标题 / 描述 / 内容 / 底栏                        |
| `Tabs`         | navigation  | 方向键与 Home / End 导航，自动激活面板                   |
| `Dialog`       | overlays    | 复合组件，含遮罩、焦点圈定与滚动锁定                     |
| `DropdownMenu` | overlays    | `menu` 语义，方向键、Home / End 与 typeahead 导航        |
| `Popover`      | overlays    | 点击触发，内容可交互，外部点击 / Escape 关闭             |
| `Tooltip`      | overlays    | 悬停或聚焦触发，只承载不可交互的短文案                   |

## Hooks

| Hook / 类型               | 说明                                          |
| ------------------------- | --------------------------------------------- |
| `useControllableState`    | 受控 / 非受控通用状态                         |
| `useDismiss`              | 外部点击与 Escape 关闭浮层，`reason` 区分原因 |
| `useFocusTrap`            | 把焦点圈定在容器内，停用后归还                |
| `useFloatingPosition`     | 测量锚点并计算 fixed 定位坐标，带翻转收边     |
| `usePresence`             | 离场动画期间延后卸载                          |
| `useScrollLock`           | 模态打开时锁定 body 滚动                      |

## 可访问性

- 遵循 WAI-ARIA 的语义与键盘交互约定（对话框、菜单、标签页、开关等）。
- 焦点环、`prefers-reduced-motion` 与 `forced-colors`（高对比度）均有适配。
- CI 中通过 `eslint-plugin-jsx-a11y` 与 `axe-core` 做无障碍回归。

## License

MIT
