import { ScaleIn } from '@elyri/motion';

export interface ScaleInDemoProps {
  from: number;
  duration: number;
  stagger: number;
  once: boolean;
  items: string[];
}

export default function ScaleInDemo({ from, duration, stagger, once, items }: ScaleInDemoProps) {
  return (
    <div className="demo-stack">
      {items.map((label, index) => (
        <ScaleIn key={label} className="demo-card" from={from} duration={duration} delay={index * stagger} once={once}>
          {label}
        </ScaleIn>
      ))}
    </div>
  );
}
