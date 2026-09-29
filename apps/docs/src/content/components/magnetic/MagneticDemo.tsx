import { Magnetic } from '@elyri/motion';

export interface MagneticDemoProps {
  strength: number;
  range: number;
  resetDuration: number;
}

export default function MagneticDemo({ strength, range, resetDuration }: MagneticDemoProps) {
  return (
    <Magnetic strength={strength} range={range} resetDuration={resetDuration}>
      <button type="button" className="demo-magnetic-button">
        Hover me
      </button>
    </Magnetic>
  );
}
