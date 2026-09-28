import { Tilt } from 'elyri';

export interface TiltDemoProps {
  max: number;
  perspective: number;
  glare: boolean;
}

export default function TiltDemo({ max, perspective, glare }: TiltDemoProps) {
  return (
    <Tilt className="demo-tilt" max={max} perspective={perspective} glare={glare}>
      Elyri Tilt
    </Tilt>
  );
}
