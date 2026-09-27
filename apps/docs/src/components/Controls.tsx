import { useI18n } from '../lib/i18n';
import type { Control, ControlValue, ControlValues } from '../lib/types';

import { ColorPicker } from './ColorPicker';

interface ControlsProps {
  controls: Control[];
  values: ControlValues;
  onChange: (name: string, value: ControlValue) => void;
}

export function Controls({ controls, values, onChange }: ControlsProps) {
  const { t } = useI18n();

  return (
    <div className="controls">
      {controls.map((control) => {
        const label = control.label ?? control.name;
        const value = values[control.name];

        switch (control.type) {
          case 'number':
            return (
              <label key={control.name} className="control control-number">
                <span className="control-label">
                  {label}
                  <span className="control-value">{value as number}</span>
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step ?? 1}
                  value={value as number}
                  onChange={(e) => onChange(control.name, Number(e.target.value))}
                />
              </label>
            );
          case 'boolean':
            return (
              <label key={control.name} className="control control-inline">
                <span className="control-label">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={value as boolean}
                  className={value ? 'switch is-on' : 'switch'}
                  onClick={() => onChange(control.name, !value)}
                >
                  <span className="switch-thumb" />
                </button>
              </label>
            );
          case 'select':
            return (
              <label key={control.name} className="control">
                <span className="control-label">{label}</span>
                <div className="segmented">
                  {control.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={option === value ? 'segmented-item is-active' : 'segmented-item'}
                      onClick={() => onChange(control.name, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </label>
            );
          case 'color':
            return (
              <div key={control.name} className="control control-inline">
                <span className="control-label">{label}</span>
                <ColorPicker
                  value={value as string}
                  label={`${label} · ${t('color.label')}`}
                  onChange={(next) => onChange(control.name, next)}
                />
              </div>
            );
          case 'text':
            return (
              <label key={control.name} className="control control-inline">
                <span className="control-label">{label}</span>
                <input
                  type="text"
                  className="text-input"
                  value={value as string}
                  onChange={(e) => onChange(control.name, e.target.value)}
                />
              </label>
            );
        }
      })}
    </div>
  );
}
