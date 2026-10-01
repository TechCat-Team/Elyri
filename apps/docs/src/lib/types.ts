import type { ComponentType, ReactNode } from 'react';

/** 文档语言 */
export type Lang = 'zh' | 'en';

/** 代码示例语言 */
export type CodeLang = 'ts' | 'js';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

/** 顶层分区 / 来源包：动效、UI 基础组件、页面区块 */
export type Pkg = 'motion' | 'ui' | 'blocks';

export type ControlValue = string | number | boolean;
export type ControlValues = Record<string, ControlValue>;

interface BaseControl {
  name: string;
  label?: string;
}

export type Control =
  | (BaseControl & { type: 'number'; default: number; min: number; max: number; step?: number })
  | (BaseControl & { type: 'boolean'; default: boolean })
  | (BaseControl & { type: 'select'; default: string; options: string[] })
  | (BaseControl & { type: 'text'; default: string })
  | (BaseControl & { type: 'color'; default: string });

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** UI 组件的单个示例：标题 + 预览 + 对应代码 */
export interface ComponentExample {
  /** 示例标题，如「全部变体」「尺寸」「状态」 */
  title: string;
  /** 可选说明 */
  description?: string;
  render: () => ReactNode;
  /** 与该示例一一对应的代码 */
  code: string;
  /** 需要更宽画布时开启（Tabs、Toast、Progress 等） */
  wide?: boolean;
}

export interface ComponentDoc {
  slug: string;
  title: string;
  category: string;
  /** 所属分区与来源包，省略按动效处理 */
  pkg?: Pkg;
  description: string;
  isNew?: boolean;
  /** 演示顶部带 BackgroundHero 落地页内容，预览可用开关隐藏 */
  hero?: boolean;
  controls?: Control[];
  /** 某个控件变化时联动修改其他控件的值（例如切换预设时重置配色） */
  linkedValues?: (name: string, value: ControlValue) => ControlValues | undefined;
  /** 卡片缩略图覆盖的控件值（小尺寸下压掉星空等重效果） */
  showcaseValues?: ControlValues;
  props: PropDoc[];
  dependencies?: string[];
  /** UI 基础组件的多示例画廊；设置后组件页改用画廊布局 */
  examples?: ComponentExample[];
  render?: (values: ControlValues) => ReactNode;
  usage?: (values: ControlValues, codeLang: CodeLang) => string;
}

/** 文档（指南）页 */
export interface DocPage {
  /** /docs 下的子路径，文档首页为空串 */
  slug: string;
  group: 'start' | 'guides';
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  Component: ComponentType;
}

/** 单个页面的 SEO 信息，预渲染与服务端都从这里取 */
export interface PageMeta {
  title: string;
  description: string;
  /** 没有匹配到任何页面 */
  notFound?: boolean;
}
