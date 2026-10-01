import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../lib/i18n';
import type { DocPage } from '../../lib/types';

import { Callout, DocSection } from './prose';

const HOOK_EXAMPLE = `import { usePrefersReducedMotion } from '@elyri/motion';

export function HeroVideo() {
  const reduced = usePrefersReducedMotion();
  return reduced ? <img src="/hero.jpg" alt="" /> : <video src="/hero.mp4" autoPlay muted loop />;
}`;

const PROVIDER_EXAMPLE = `import { Aurora, ReducedMotionProvider } from '@elyri/motion';

export function Thumbnail({ playing }: { playing: boolean }) {
  // 未悬停时强制静止，悬停后播放
  return (
    <ReducedMotionProvider reduced={!playing}>
      <Aurora />
    </ReducedMotionProvider>
  );
}`;

const PROVIDER_EXAMPLE_EN = PROVIDER_EXAMPLE.replace(
  '未悬停时强制静止，悬停后播放',
  'Still until hovered, then play',
);

function ReducedMotion() {
  const { lang } = useI18n();
  const zh = lang === 'zh';

  return (
    <>
      <DocSection id="default" title={zh ? '默认行为' : 'Default behaviour'}>
        <p>
          {zh
            ? '当用户在系统中开启「减弱动态效果」（prefers-reduced-motion: reduce）时，组件会自动降级，无需额外配置：'
            : 'When the user enables reduced motion in their OS (prefers-reduced-motion: reduce), components adapt automatically:'}
        </p>
        <ul>
          {zh ? (
            <>
              <li>入场类动画直接呈现最终状态，不再位移或淡入。</li>
              <li>WebGL 背景只绘制一帧静止画面，不再持续渲染。</li>
              <li>循环的 CSS 动画停止播放。</li>
            </>
          ) : (
            <>
              <li>Entrance animations render their final state without moving or fading.</li>
              <li>WebGL backgrounds draw a single still frame and stop rendering.</li>
              <li>Looping CSS animations stop.</li>
            </>
          )}
        </ul>
      </DocSection>

      <DocSection id="hook" title="usePrefersReducedMotion">
        <p>
          {zh
            ? '在自己的组件里读取同一份偏好，让整站行为保持一致。它也会读取外层 ReducedMotionProvider 的设置。'
            : 'Read the same preference in your own components to keep the whole site consistent. It also respects any surrounding ReducedMotionProvider.'}
        </p>
        <CodeBlock title="HeroVideo.tsx" code={HOOK_EXAMPLE} />
      </DocSection>

      <DocSection id="provider" title="ReducedMotionProvider">
        <p>
          {zh ? (
            <>
              不改系统设置，强制某棵子树静止（<code>reduced</code>）或播放（<code>{'reduced={false}'}</code>
              ），优先级高于系统偏好。适合缩略图墙、站内「关闭动画」开关等场景。
            </>
          ) : (
            <>
              Force a subtree to stay still (<code>reduced</code>) or play (<code>{'reduced={false}'}</code>) regardless
              of the system setting. Useful for thumbnail grids or an in-app “disable animations” toggle.
            </>
          )}
        </p>
        <CodeBlock title="Thumbnail.tsx" code={zh ? PROVIDER_EXAMPLE : PROVIDER_EXAMPLE_EN} />
        <Callout>
          {zh
            ? '强制 reduced={false} 会无视用户的系统设置，请只在用户主动选择时使用。'
            : 'Forcing reduced={false} overrides the user’s system setting — only do it when the user explicitly opts in.'}
        </Callout>
      </DocSection>

      <DocSection id="performance" title={zh ? '性能' : 'Performance'}>
        <ul>
          {zh ? (
            <>
              <li>WebGL 背景离开视口或页面切到后台时暂停渲染，回来后继续。</li>
              <li>渲染分辨率默认不超过 2 倍设备像素比，高分屏上也不会过度消耗 GPU。</li>
              <li>服务端渲染时偏好按「不减弱」输出，水合后切换为真实值，不会产生水合不一致。</li>
            </>
          ) : (
            <>
              <li>WebGL backgrounds pause offscreen and in background tabs, and resume when visible.</li>
              <li>Rendering is capped at 2× device pixel ratio by default to keep GPU cost in check on dense screens.</li>
              <li>
                During server rendering the preference is treated as “no reduction” and switches to the real value
                after hydration, avoiding mismatches.
              </li>
            </>
          )}
        </ul>
      </DocSection>
    </>
  );
}

export const reducedMotionPage: DocPage = {
  slug: 'reduced-motion',
  group: 'guides',
  title: { zh: '减弱动效', en: 'Reduced motion' },
  description: {
    zh: '组件如何跟随系统的减弱动效设置，以及如何按需强制播放或静止。',
    en: 'How components follow the reduced motion preference, and how to force a subtree to play or stay still.',
  },
  Component: ReducedMotion,
};
