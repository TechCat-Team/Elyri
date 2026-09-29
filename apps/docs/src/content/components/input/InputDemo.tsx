import { Input } from '@elyri/ui';

export interface InputDemoProps {
  placeholder: string;
  size: 'sm' | 'md' | 'lg';
  invalid: boolean;
}

export default function InputDemo({ placeholder, size, invalid }: InputDemoProps) {
  return (
    <div className="demo-stack">
      <label className="demo-ui-field">
        <span className="demo-ui-label">{invalid ? 'Email · invalid' : 'Email'}</span>
        <Input size={size} invalid={invalid} placeholder={placeholder} defaultValue="hello@elyri.dev" />
      </label>
      <label className="demo-ui-field">
        <span className="demo-ui-label">Disabled</span>
        <Input size={size} placeholder="Not available" disabled />
      </label>
    </div>
  );
}
