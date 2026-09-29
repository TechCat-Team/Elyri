import { SplitReveal } from '@elyri/motion';
import type { SplitRevealBy } from '@elyri/motion';

export interface SplitRevealDemoProps {
  text: string;
  by: SplitRevealBy;
  delay: number;
  stagger: number;
  duration: number;
  distance: number;
  once: boolean;
}

export default function SplitRevealDemo({ text, by, delay, stagger, duration, distance, once }: SplitRevealDemoProps) {
  return (
    <div className="demo-text">
      <SplitReveal
        className="demo-title"
        by={by}
        delay={delay}
        stagger={stagger}
        duration={duration}
        distance={distance}
        once={once}
      >
        {text}
      </SplitReveal>
    </div>
  );
}
