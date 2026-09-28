import { DragonScales } from 'elyri';
import type { DragonScalesProps } from 'elyri';

export interface DragonScalesDemoProps extends DragonScalesProps {
  text: string;
}

const NAV_LINKS = ['Components', 'Docs', 'GitHub'];

export default function DragonScalesDemo({ text, ...props }: DragonScalesDemoProps) {
  return (
    <DragonScales className="demo-dragon" {...props}>
      <div className="demo-dragon-content">
        <header className="demo-hero-nav">
          <span className="demo-hero-brand">Elyri</span>
          <nav className="demo-hero-links">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#/components/dragon-scales">
                {link}
              </a>
            ))}
          </nav>
        </header>

        <div className="demo-hero">
          <span className="demo-hero-badge">WebGL · Real-time</span>
          <h1 className="demo-hero-title">{text}</h1>
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
    </DragonScales>
  );
}
