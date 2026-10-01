import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ReducedMotionProvider, usePrefersReducedMotion } from '@elyri/motion';

import { useI18n } from '../lib/i18n';
import { Link } from '../lib/router';
import { docPath } from '../lib/sections';
import type { ComponentDoc, ControlValues } from '../lib/types';

const defaultsOf = (doc: ComponentDoc): ControlValues =>
  Object.fromEntries((doc.controls ?? []).map((control) => [control.name, control.default]));

/**
 * 组件卡片：靠近视口后挂载演示，但默认渲染成静止帧；
 * 鼠标悬停（触屏设备为进入视口）才播放动画。
 * 静止由组件库的 ReducedMotionProvider 强制，空闲时不会跑 RAF。
 */
export function ShowcaseCard({ doc }: { doc: ComponentDoc }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  // 用户系统层面要求减弱动效时，始终静止，悬停也不播放
  const systemReducedMotion = usePrefersReducedMotion();
  // 触屏等不支持悬停的设备用可见性兜底；服务端先按可悬停处理，与客户端首帧一致
  const canHover = useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia('(hover: hover)');
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(hover: hover)').matches,
    () => true,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: '150px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const playing = canHover ? hovered : inView;

  return (
    <div
      className="showcase-card"
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className={playing ? 'showcase-preview is-playing' : 'showcase-preview'}>
        {mounted && (
          <ReducedMotionProvider reduced={systemReducedMotion || !playing}>
            <Suspense fallback={<div className="demo-fallback" />}>
              {doc.examples?.length
                ? doc.examples[0].render()
                : doc.render?.({ ...defaultsOf(doc), ...doc.showcaseValues })}
            </Suspense>
          </ReducedMotionProvider>
        )}
      </div>
      <div className="showcase-card-body">
        <div className="showcase-card-head">
          <span className="showcase-card-title">{doc.title}</span>
          {doc.isNew && <span className="new-tag">{t('tag.new')}</span>}
        </div>
        <p className="showcase-card-desc">{doc.description}</p>
      </div>
      <Link className="showcase-card-link" to={docPath(doc)} aria-label={doc.title} />
    </div>
  );
}
