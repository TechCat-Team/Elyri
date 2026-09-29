import { WaveText } from '@elyri/motion';

export interface WaveTextDemoProps {
  text: string;
  amplitude: number;
  speed: number;
  stagger: number;
}

export default function WaveTextDemo({ text, amplitude, speed, stagger }: WaveTextDemoProps) {
  return (
    <div className="demo-text">
      <WaveText className="demo-title" amplitude={amplitude} speed={speed} stagger={stagger}>
        {text}
      </WaveText>
    </div>
  );
}
