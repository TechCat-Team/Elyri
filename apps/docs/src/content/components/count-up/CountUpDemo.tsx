import { CountUp } from '@elyri/motion';

export interface CountUpDemoProps {
  to: number;
  duration: number;
  decimals: number;
  separator: boolean;
  prefix: string;
  suffix: string;
}

export default function CountUpDemo({ to, duration, decimals, separator, prefix, suffix }: CountUpDemoProps) {
  return (
    <div className="demo-text">
      <CountUp
        className="demo-title"
        to={to}
        duration={duration}
        decimals={decimals}
        separator={separator}
        prefix={prefix}
        suffix={suffix}
      />
    </div>
  );
}
