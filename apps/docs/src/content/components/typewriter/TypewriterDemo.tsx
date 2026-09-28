import { Typewriter } from 'elyri';

export interface TypewriterDemoProps {
  text: string;
  speed: number;
  startDelay: number;
  loop: boolean;
  loopDelay: number;
  cursor: boolean;
}

export default function TypewriterDemo({ text, speed, startDelay, loop, loopDelay, cursor }: TypewriterDemoProps) {
  return (
    <div className="demo-text">
      <Typewriter
        className="demo-title"
        speed={speed}
        startDelay={startDelay}
        loop={loop}
        loopDelay={loopDelay}
        cursor={cursor}
      >
        {text}
      </Typewriter>
    </div>
  );
}
