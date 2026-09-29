import { Spotlight } from 'elyri';

export interface SpotlightDemoProps {
  color: string;
  size: number;
  glow: boolean;
  borderGlow: boolean;
  radius: number;
}

export default function SpotlightDemo({ color, size, glow, borderGlow, radius }: SpotlightDemoProps) {
  return (
    <Spotlight className="demo-spotlight" color={color} size={size} glow={glow} borderGlow={borderGlow} radius={radius}>
      <div className="demo-spotlight-body">
        <span className="demo-spotlight-title">Elyri Spotlight</span>
        <span className="demo-spotlight-hint">Move your pointer across the card</span>
        <button type="button" className="demo-spotlight-button elyri-spotlight__item">
          Learn More
        </button>
      </div>
    </Spotlight>
  );
}
