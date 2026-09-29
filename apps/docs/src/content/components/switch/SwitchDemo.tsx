import { Switch } from '@elyri/ui';

export interface SwitchDemoProps {
  size: 'sm' | 'md';
  checked: boolean;
  disabled: boolean;
}

export default function SwitchDemo({ size, checked, disabled }: SwitchDemoProps) {
  return (
    // key 跟随控件面板：参数变化时重建演示，让 defaultChecked 回到最新值
    <div key={`${size}-${checked}-${disabled}`} className="demo-stack">
      <div className="demo-ui-switch-row">
        <span>Email notifications</span>
        <Switch size={size} defaultChecked={checked} disabled={disabled} aria-label="Email notifications" />
      </div>
      <div className="demo-ui-switch-row">
        <span>Product updates</span>
        <Switch size={size} disabled={disabled} aria-label="Product updates" />
      </div>
    </div>
  );
}
