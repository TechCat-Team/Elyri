import type { ReactNode } from 'react';

/** 文档语言 */
export type Lang = 'zh' | 'en';

/** 代码示例语言 */
export type CodeLang = 'ts' | 'js';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

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
  description: string;
  isNew?: boolean;
  controls?: Control[];
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
