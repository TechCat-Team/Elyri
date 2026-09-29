import { cn, Marquee } from '@elyri/motion';
import type { MarqueeDirection } from '@elyri/motion';

export interface MarqueeDemoProps {
  text: string;
  direction: MarqueeDirection;
  duration: number;
  gap: number;
}

export default function MarqueeDemo({ text, direction, duration, gap }: MarqueeDemoProps) {
  const items = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const vertical = direction === 'up' || direction === 'down';

  return (
    <Marquee
      className={cn('demo-marquee-auto', vertical && 'demo-marquee-auto--vertical')}
      direction={direction}
      duration={duration}
      gap={gap}
    >
      {items.map((item) => (
        <span key={item} className="demo-pill">
          {item}
        </span>
      ))}
    </Marquee>
  );
}
