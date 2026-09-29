import { RotatingText } from 'elyri';

export interface RotatingTextDemoProps {
  /** 逗号分隔的词语列表 */
  words: string;
  interval: number;
  duration: number;
  variant: 'flip' | 'block';
}

export default function RotatingTextDemo({ words, interval, duration, variant }: RotatingTextDemoProps) {
  const list = words
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);

  return (
    <div className="demo-text">
      <div className="demo-title demo-rotating-text">
        <span>Elyri is</span>
        <RotatingText words={list.length ? list : ['Elyri']} interval={interval} duration={duration} variant={variant} />
      </div>
    </div>
  );
}
