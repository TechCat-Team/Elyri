import { ScrollMarquee } from 'elyri';
import type { ScrollMarqueeDirection } from 'elyri';

export interface ScrollMarqueeDemoProps {
  text: string;
  direction: ScrollMarqueeDirection;
  speed: number;
  rows: number;
}

export default function ScrollMarqueeDemo({ text, direction, speed, rows }: ScrollMarqueeDemoProps) {
  return (
    <ScrollMarquee className="demo-marquee" direction={direction} speed={speed} rows={rows}>
      {text}
    </ScrollMarquee>
  );
}
