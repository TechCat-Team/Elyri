import { site } from './site';
import type { CodeLang, ControlValue, PackageManager } from './types';

const TOKEN =
  /(\/\/.*$|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*)|\b(import|from|export|const|let|function|return|default|type|interface|if|else|true|false|null|undefined|new)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$-]*)(?==)/gm;

const KINDS = ['comment', 'string', 'tag', 'keyword', 'number', 'attr'] as const;

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 轻量 TS/JSX 高亮，返回 HTML 字符串 */
export function highlight(code: string) {
  let html = '';
  let last = 0;

  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    const kind = KINDS[match.slice(1).findIndex(Boolean)];
    html += escape(code.slice(last, index));
    html += `<span class="tok-${kind}">${escape(match[0])}</span>`;
    last = index + match[0].length;
  }

  return html + escape(code.slice(last));
}

type PropValue = ControlValue | string[] | undefined;

const INSTALL_COMMANDS: Record<PackageManager, (pkg: string) => string> = {
  pnpm: (pkg) => `pnpm add ${pkg}`,
  npm: (pkg) => `npm install ${pkg}`,
  yarn: (pkg) => `yarn add ${pkg}`,
  bun: (pkg) => `bun add ${pkg}`,
};

export const installCommand = (manager: PackageManager, pkg = site.packageName) => INSTALL_COMMANDS[manager](pkg);

/** 对象字面量里的值，字符串与数组统一用单引号 */
const formatValue = (value: PropValue) => {
  if (value === undefined) return null;
  if (typeof value === 'string') return `'${value}'`;
  if (Array.isArray(value)) return `[${value.map((item) => `'${item}'`).join(', ')}]`;
  return String(value);
};

interface UsageExample {
  /** 组件名，用于 import 与标签 */
  component: string;
  /** 组件的 props 类型名，仅 TS 变体使用 */
  propsType: string;
  /** 示例 props，值为 undefined 的会被省略 */
  props: Record<string, PropValue>;
  /** 子元素，省略则为自闭合标签 */
  children?: string;
  name?: string;
}

/**
 * 生成可复制的使用示例。
 * TS 变体会把 props 标注为组件的 props 类型，JS 变体则是普通对象字面量。
 */
export function usageExample(
  lang: CodeLang,
  { component, propsType, props, children, name = 'Example' }: UsageExample,
) {
  const entries = Object.entries(props)
    .map(([key, value]) => [key, formatValue(value)] as const)
    .filter((entry): entry is [string, string] => entry[1] !== null);
  const hasProps = entries.length > 0;

  const imports = [`import { ${component} } from '${site.packageName}';`];
  if (hasProps && lang === 'ts') {
    imports.push(`import type { ${propsType} } from '${site.packageName}';`);
  }

  const target = hasProps ? `<${component} {...props}` : `<${component}`;
  const body = children ? `    ${target}>\n      ${children}\n    </${component}>` : `    ${target} />`;

  return [
    ...imports,
    '',
    ...(hasProps
      ? [
          lang === 'ts' ? `const props: ${propsType} = {` : 'const props = {',
          ...entries.map(([key, value]) => `  ${key}: ${value},`),
          '};',
          '',
        ]
      : []),
    `export function ${name}() {`,
    '  return (',
    body,
    '  );',
    '}',
  ].join('\n');
}
