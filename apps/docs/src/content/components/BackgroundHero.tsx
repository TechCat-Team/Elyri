import type { CSSProperties } from 'react';

const NAV_LINKS = ['Components', 'Docs', 'GitHub'];

export interface BackgroundHeroProps {
  title: string;
  /** 组件文档路径，导航链接指向它 */
  slug: string;
  /** 徽章、按钮与标题光晕使用的强调色 */
  accent: string;
}

/** 背景类组件共用的落地页式演示内容 */
export function BackgroundHero({ title, slug, accent }: BackgroundHeroProps) {
  return (
    <div className="demo-background-content" style={{ '--demo-accent': accent } as CSSProperties}>
      <header className="demo-hero-nav">
        <span className="demo-hero-brand">Elyri</span>
        <nav className="demo-hero-links">
          {NAV_LINKS.map((link) => (
            <a key={link} href={`#/components/${slug}`}>
              {link}
            </a>
          ))}
        </nav>
      </header>

      <div className="demo-hero">
        <span className="demo-hero-badge">WebGL · Real-time</span>
        <h1 className="demo-hero-title">{title}</h1>
        <p className="demo-hero-subtitle">
          A React library of living backgrounds, motion and text effects — built to make your interface feel alive.
        </p>
        <div className="demo-hero-actions">
          <button type="button" className="demo-hero-button demo-hero-button--primary">
            Get started
          </button>
          <button type="button" className="demo-hero-button demo-hero-button--ghost">
            Browse components
          </button>
        </div>
      </div>
    </div>
  );
}
