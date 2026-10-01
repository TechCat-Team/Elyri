import { Progress } from '@elyri/ui';

export interface ProgressDemoProps {
  value: number;
  variant: 'accent' | 'success' | 'warning' | 'danger';
  size: 'sm' | 'md';
  indeterminate: boolean;
  showValue: boolean;
}

const STEPS = [25, 60, 90];

export default function ProgressDemo({ value, variant, size, indeterminate, showValue }: ProgressDemoProps) {
  return (
    <div className="demo-ui-stack">
      <Progress
        value={value}
        variant={variant}
        size={size}
        indeterminate={indeterminate}
        showValue={showValue}
        label="Progress"
      />

      {STEPS.map((step) => (
        <Progress
          key={step}
          value={step}
          variant={variant}
          size={size}
          showValue={showValue}
          label={`Progress ${step}`}
        />
      ))}
    </div>
  );
}
