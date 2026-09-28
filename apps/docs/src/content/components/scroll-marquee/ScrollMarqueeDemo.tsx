import { ScrollMarquee } from 'elyri';
import type { ScrollMarqueeDirection } from 'elyri';

export interface ScrollMarqueeDemoProps {
  text: string;
  direction: ScrollMarqueeDirection;
  speed: number;
  rows: number;
  infinite: boolean;
}

export default function ScrollMarqueeDemo({ text, direction, speed, rows, infinite }: ScrollMarqueeDemoProps) {
  return (
    <ScrollMarquee className="demo-marquee" direction={direction} speed={speed} rows={rows} infinite={infinite}>
      {text}
    </ScrollMarquee>
  );
}
