import { Badge } from '@elyri/ui';

const VARIANTS = ['neutral', 'accent', 'success', 'warning', 'danger'] as const;

export interface BadgeDemoProps {
  text: string;
  variant: string;
  size: 'sm' | 'md';
  bordered: boolean;
}

export default function BadgeDemo({ text, variant, size, bordered }: BadgeDemoProps) {
  const others = VARIANTS.filter((item) => item !== variant);

  return (
    <div className="demo-ui-row">
      <Badge variant={variant as (typeof VARIANTS)[number]} size={size} bordered={bordered}>
        {text}
      </Badge>
      {others.map((item) => (
        <Badge key={item} variant={item} size={size} bordered={bordered}>
          {item}
        </Badge>
      ))}
    </div>
  );
}
