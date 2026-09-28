import { AsciiImage } from 'elyri';
import type { AsciiImageProps } from 'elyri';

export default function AsciiImageDemo(props: AsciiImageProps) {
  return (
    <div className="demo-ascii">
      <AsciiImage {...props} />
    </div>
  );
}
