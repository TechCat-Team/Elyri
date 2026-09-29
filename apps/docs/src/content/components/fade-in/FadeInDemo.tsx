import { FadeIn } from '@elyri/motion';

export interface FadeInDemoProps {
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
  duration: number;
  distance: number;
  stagger: number;
  once: boolean;
  items: string[];
}

export default function FadeInDemo({ direction, duration, distance, stagger, once, items }: FadeInDemoProps) {
  return (
    <div className="demo-stack">
      {items.map((label, index) => (
        <FadeIn
          key={label}
          className="demo-card"
          direction={direction}
          duration={duration}
          distance={distance}
          delay={index * stagger}
          once={once}
        >
          {label}
        </FadeIn>
      ))}
    </div>
  );
}
