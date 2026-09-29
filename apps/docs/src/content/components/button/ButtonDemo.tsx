import { Button } from '@elyri/ui';

export interface ButtonDemoProps {
  text: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading: boolean;
}

export default function ButtonDemo({ text, variant, size, loading }: ButtonDemoProps) {
  return (
    <div className="demo-ui-row">
      <Button variant={variant} size={size} loading={loading}>
        {text}
      </Button>
      <Button variant="secondary" size={size}>
        Secondary
      </Button>
      <Button variant="ghost" size={size}>
        Ghost
      </Button>
      <Button variant="danger" size={size}>
        Delete
      </Button>
    </div>
  );
}
