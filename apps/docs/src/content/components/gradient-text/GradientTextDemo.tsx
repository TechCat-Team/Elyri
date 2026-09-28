import { GradientText } from 'elyri';

export interface GradientTextDemoProps {
  text: string;
  colors: string[];
  animated: boolean;
  speed: number;
}

export default function GradientTextDemo({ text, colors, animated, speed }: GradientTextDemoProps) {
  return (
    <div className="demo-stack">
      <GradientText className="demo-title" colors={colors} animated={animated} speed={speed}>
        {text}
      </GradientText>
    </div>
  );
}
