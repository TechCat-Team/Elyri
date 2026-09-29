import { ScrollReveal } from '@elyri/motion';
import type { ScrollRevealBy } from '@elyri/motion';

export interface ScrollRevealDemoProps {
  text: string;
  by: ScrollRevealBy;
  height: number;
  dimOpacity: number;
  blur: number;
}

export default function ScrollRevealDemo({ text, by, height, dimOpacity, blur }: ScrollRevealDemoProps) {
  return (
    <div className="demo-scroll-reveal">
      <ScrollReveal by={by} height={height} dimOpacity={dimOpacity} blur={blur}>
        {text}
      </ScrollReveal>
    </div>
  );
}
