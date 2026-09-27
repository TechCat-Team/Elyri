import { GradientText } from 'elyri';

export interface GradientTextDemoProps {
  text: string;
  colors: string[];
  animated: boolean;
}

export default function GradientTextDemo({ text, colors, animated }: GradientTextDemoProps) {
  return (
    <div className="demo-stack">
      <GradientText className="demo-title" colors={colors} animated={animated}>
        {text}
      </GradientText>
    </div>
  );
}
