import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../lib/i18n';
import type { DocPage } from '../../lib/types';

import { Callout, DocSection, DocTable } from './prose';

const MOTION_TOKENS: [string, string, string, string][] = [
  ['--elyri-ease-out', 'cubic-bezier(0.16, 1, 0.3, 1)', '入场、展开的缓动', 'Easing for entrances'],
  ['--elyri-ease-in-out', 'cubic-bezier(0.65, 0, 0.35, 1)', '往复、循环的缓动', 'Easing for loops'],
  ['--elyri-duration-fast', '200ms', '短时长', 'Short duration'],
  ['--elyri-duration-base', '400ms', '常规时长', 'Base duration'],
  ['--elyri-duration-slow', '800ms', '长时长', 'Long duration'],
];

const UI_TOKENS: [string, string, string][] = [
  ['--elyri-ui-accent', '强调色（主按钮、选中态）', 'Accent (primary buttons, selection)'],
  ['--elyri-ui-accent-text', '强调色上的文字', 'Text on accent'],
  ['--elyri-ui-accent-soft', '浅强调底色', 'Soft accent background'],
  ['--elyri-ui-text / --elyri-ui-muted', '正文 / 次要文字', 'Body / secondary text'],
  ['--elyri-ui-surface / --elyri-ui-surface-muted', '表面 / 次级表面', 'Surface / muted surface'],
  ['--elyri-ui-border', '边框', 'Borders'],
  ['--elyri-ui-danger / -success / -warning', '状态色', 'Status colours'],
  ['--elyri-ui-radius / --elyri-ui-radius-sm', '圆角', 'Corner radius'],
  ['--elyri-ui-shadow / --elyri-ui-ring', '阴影 / 焦点环', 'Shadow / focus ring'],
  ['--elyri-ui-duration / --elyri-ui-ease', '交互过渡', 'Interaction transitions'],
];

const GLOBAL_CSS = `:root {
  --elyri-duration-base: 500ms;
  --elyri-ui-accent: #0f766e;
  --elyri-ui-accent-soft: rgb(15 118 110 / 12%);
  --elyri-ui-radius: 6px;
}`;

const SCOPED_CSS = `/* 只影响 .marketing 内部的组件 */
.marketing {
  --elyri-ui-accent: #e11d48;
  --elyri-duration-base: 700ms;
}`;

const SCOPED_CSS_EN = SCOPED_CSS.replace('只影响 .marketing 内部的组件', 'Only affects components inside .marketing');

const DARK_CSS = `/* 站点用 data-theme 切换明暗时，按同一选择器覆盖 */
:root[data-theme='light'] {
  --elyri-ui-text: #1a1d23;
  --elyri-ui-surface: #ffffff;
}
:root[data-theme='dark'] {
  --elyri-ui-text: #eef0f4;
  --elyri-ui-surface: #16191f;
}`;

const DARK_CSS_EN = DARK_CSS.replace(
  '站点用 data-theme 切换明暗时，按同一选择器覆盖',
  'If your site toggles themes with data-theme, override under the same selector',
);

function Theming() {
  const { lang } = useI18n();
  const zh = lang === 'zh';

  return (
    <>
      <DocSection id="how" title={zh ? '工作方式' : 'How it works'}>
        <p>
          {zh ? (
            <>
              所有可定制的值都是以 <code>--elyri-</code> 开头的 CSS 变量，默认值由 <code>styles.css</code> 定义在{' '}
              <code>:root</code> 上。覆盖变量即可换肤，不需要改组件代码。
            </>
          ) : (
            <>
              Every customisable value is a CSS variable prefixed with <code>--elyri-</code>, with defaults declared on{' '}
              <code>:root</code> by <code>styles.css</code>. Override the variables to restyle — no component changes
              needed.
            </>
          )}
        </p>
      </DocSection>

      <DocSection id="global" title={zh ? '全局覆盖' : 'Global overrides'}>
        <p>
          {zh
            ? '在 styles.css 之后加载的样式表里，于 :root 上重新声明变量：'
            : 'Redeclare variables on :root in a stylesheet loaded after styles.css:'}
        </p>
        <CodeBlock title="theme.css" code={GLOBAL_CSS} />
      </DocSection>

      <DocSection id="scoped" title={zh ? '局部覆盖' : 'Scoped overrides'}>
        <p>
          {zh
            ? 'CSS 变量会向下继承，把它写在任意容器上，就只影响该容器内的组件。'
            : 'CSS variables inherit, so declaring them on any container scopes the change to that subtree.'}
        </p>
        <CodeBlock title="theme.css" code={zh ? SCOPED_CSS : SCOPED_CSS_EN} />
      </DocSection>

      <DocSection id="motion-tokens" title={zh ? '动效变量（@elyri/motion）' : 'Motion tokens (@elyri/motion)'}>
        <DocTable
          head={zh ? ['变量', '默认值', '用途'] : ['Variable', 'Default', 'Purpose']}
          rows={MOTION_TOKENS.map(([name, value, zhDesc, enDesc]) => [
            <code key="n" className="prop-name">
              {name}
            </code>,
            <code key="v">{value}</code>,
            zh ? zhDesc : enDesc,
          ])}
        />
      </DocSection>

      <DocSection id="ui-tokens" title={zh ? 'UI 变量（@elyri/ui）' : 'UI tokens (@elyri/ui)'}>
        <DocTable
          head={zh ? ['变量', '用途'] : ['Variable', 'Purpose']}
          rows={UI_TOKENS.map(([name, zhDesc, enDesc]) => [
            <code key="n" className="prop-name">
              {name}
            </code>,
            zh ? zhDesc : enDesc,
          ])}
        />
      </DocSection>

      <DocSection id="dark-mode" title={zh ? '深色模式' : 'Dark mode'}>
        <p>
          {zh ? (
            <>
              UI 变量默认通过 <code>prefers-color-scheme</code> 跟随系统明暗。如果站点有自己的主题开关，请在对应选择器下同时覆盖浅色与深色两套值，避免系统设置与站点主题不一致时出现混搭。
            </>
          ) : (
            <>
              UI tokens follow the system via <code>prefers-color-scheme</code> by default. If your site has its own
              theme switch, override both the light and dark values under that selector so the system setting cannot
              leak through.
            </>
          )}
        </p>
        <CodeBlock title="theme.css" code={zh ? DARK_CSS : DARK_CSS_EN} />
      </DocSection>

      <DocSection id="component-level" title={zh ? '组件级定制' : 'Per-component customisation'}>
        <p>
          {zh ? (
            <>
              组件还有自己的变量（如 <code>--elyri-gradient-colors</code>），以及颜色、速度、尺寸等 props。props
              会以内联样式写入，优先级高于样式表；WebGL 背景的配色只能通过 props 传入。每个组件可用的参数见组件页的「属性」表。
            </>
          ) : (
            <>
              Components also expose their own variables (such as <code>--elyri-gradient-colors</code>) and props for
              colour, speed and size. Props are applied as inline styles and win over stylesheets; WebGL backgrounds
              take colours through props only. See the Props table on each component page.
            </>
          )}
        </p>
        <Callout>
          {zh
            ? '需要超出变量范围的改动？用 CLI 把源码拷进项目后直接修改。'
            : 'Need changes beyond what variables allow? Copy the source with the CLI and edit it directly.'}
        </Callout>
      </DocSection>
    </>
  );
}

export const themingPage: DocPage = {
  slug: 'theming',
  group: 'guides',
  title: { zh: '主题定制', en: 'Theming' },
  description: {
    zh: '用 CSS 变量在全局或局部调整配色、圆角、时长与缓动，并适配深色模式。',
    en: 'Adjust colours, radii, durations and easings globally or per container with CSS variables, including dark mode.',
  },
  Component: Theming,
};
