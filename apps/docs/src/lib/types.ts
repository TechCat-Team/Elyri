import type { ReactNode } from 'react';

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
  render: (values: ControlValues) => ReactNode;
  usage: (values: ControlValues, codeLang: CodeLang) => string;
}

/** 侧栏导航项 */
export interface NavItem {
  path: string;
  title: string;
}

/** 单个页面的 SEO 信息，预渲染与服务端都从这里取 */
export interface PageMeta {
  title: string;
  description: string;
  /** 没有匹配到任何页面 */
  notFound?: boolean;
}
