import { ParticleText } from 'elyri';

export interface ParticleTextDemoProps {
  text: string;
  color: string;
  particleSize: number;
  gap: number;
  radius: number;
  force: number;
  assemble: boolean;
}

export default function ParticleTextDemo({
  text,
  color,
  particleSize,
  gap,
  radius,
  force,
  assemble,
}: ParticleTextDemoProps) {
  return (
    <div className="demo-text">
      {/* 切换聚合开关时重新挂载，便于重播飞入效果 */}
      <ParticleText
        key={String(assemble)}
        className="demo-title"
        color={color || undefined}
        particleSize={particleSize}
        gap={gap}
        radius={radius}
        force={force}
        assemble={assemble}
      >
        {text}
      </ParticleText>
    </div>
  );
}
