import { ScrambleText } from 'elyri';
import type { ScrambleTextTrigger } from 'elyri';

export interface ScrambleTextDemoProps {
  text: string;
  trigger: ScrambleTextTrigger;
  speed: number;
  stagger: number;
  characters: string;
  accentColor: string;
  glow: number;
  once: boolean;
}

export default function ScrambleTextDemo({
  text,
  trigger,
  speed,
  stagger,
  characters,
  accentColor,
  glow,
  once,
}: ScrambleTextDemoProps) {
  return (
    <div className="demo-text">
      <ScrambleText
        className="demo-title"
        trigger={trigger}
        speed={speed}
        stagger={stagger}
        characters={characters}
        accentColor={accentColor}
        glow={glow}
        once={once}
      >
        {text}
      </ScrambleText>
    </div>
  );
}
