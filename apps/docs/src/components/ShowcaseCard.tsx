import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { ReducedMotionProvider, usePrefersReducedMotion } from '@elyri/motion';

import { useI18n } from '../lib/i18n';
import { Link } from '../lib/router';
import { docPath, docPkg } from '../lib/sections';
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
  const previewRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  // UI 组件的演示常常高于缩略图，等比缩放到完整可见；动效多为满幅背景，保持原样
  const isUi = docPkg(doc) === 'ui';
  const [fit, setFit] = useState({ scale: 1, ready: !isUi });
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

  // 量出演示的自然尺寸与缩略图可用区域，取比例缩到完整可见，避免贴边或被裁切
  useEffect(() => {
    if (!isUi || !mounted) return;
    const box = previewRef.current;
    const fitNode = fitRef.current;
    const demo = fitNode?.firstElementChild;
    if (!box || !fitNode || !(demo instanceof HTMLElement)) return;

    const update = () => {
      const style = getComputedStyle(fitNode);
      const width = fitNode.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height = fitNode.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const neededWidth = demo.offsetWidth;
      const neededHeight = demo.offsetHeight;
      if (!neededWidth || !neededHeight || width <= 0 || height <= 0) return;
      setFit({ scale: Math.min(1, width / neededWidth, height / neededHeight), ready: true });
    };

    update();
    // 缩略图随栅格列宽变化、演示内容换行都会改变尺寸，用 ResizeObserver 统一兜住
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(demo);
    return () => observer.disconnect();
  }, [isUi, mounted]);

  const playing = canHover ? hovered : inView;
  const fitStyle: CSSProperties | undefined = isUi
    ? {
        transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined,
        visibility: fit.ready ? undefined : 'hidden',
      }
    : undefined;

  return (
    <div
      className="showcase-card"
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className={`showcase-preview${isUi ? ' showcase-preview--ui' : ''}${playing ? ' is-playing' : ''}`}
        ref={previewRef}
      >
        <div className="showcase-fit" ref={fitRef} style={fitStyle}>
          {mounted && (
            <ReducedMotionProvider reduced={systemReducedMotion || !playing}>
              <Suspense fallback={<div className="demo-fallback" />}>
                {doc.showcase
                  ? doc.showcase()
                  : doc.examples?.length
                    ? doc.examples[0].render()
                    : doc.render?.({ ...defaultsOf(doc), ...doc.showcaseValues })}
              </Suspense>
            </ReducedMotionProvider>
          )}
        </div>
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
