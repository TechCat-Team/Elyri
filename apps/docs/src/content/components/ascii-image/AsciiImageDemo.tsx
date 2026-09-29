import { AsciiImage } from '@elyri/motion';
import type { AsciiImageProps } from '@elyri/motion';

export default function AsciiImageDemo(props: AsciiImageProps) {
  return (
    <div className="demo-ascii">
      <AsciiImage {...props} />
    </div>
  );
}
