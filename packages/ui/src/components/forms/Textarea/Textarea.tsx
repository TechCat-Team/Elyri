import { forwardRef, useEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cn, useField, useFieldControlId } from '../../../core';

import './Textarea.css';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** 控件尺寸，默认 md */
  size?: TextareaSize;
  /** 校验失败态：红框并标记 aria-invalid；在 Field 内时与 Field 的 invalid 取并集 */
  invalid?: boolean;
  /** 高度随内容自适应，开启后禁止手动拉伸 */
  autosize?: boolean;
}

/** 多行输入：与 Input 同款尺寸与失败态；autosize 时高度跟随内容，其余属性透传给原生 textarea */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    invalid = false,
    autosize = false,
    className,
    id,
    disabled,
    required,
    value,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useField();
  useFieldControlId(id);
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const isInvalid = invalid || field?.invalid === true;
  const isRequired = required ?? field?.required;
  const describedBy = [ariaDescribedBy, ...(field?.describedIds ?? [])].filter(Boolean).join(' ') || undefined;

  // 受控时随 value 变化重新测量；非受控靠原生 input 事件兜底；关闭 autosize 时清掉行内高度
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (!autosize) {
      el.style.height = '';
      return;
    }

    const resize = () => {
      el.style.height = 'auto';
      // jsdom 等无布局环境 scrollHeight 为 0，跳过避免高度塌陷
      if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`;
    };

    resize();
    el.addEventListener('input', resize);
    return () => el.removeEventListener('input', resize);
  }, [autosize, value]);

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      id={id ?? field?.controlId}
      disabled={disabled ?? field?.disabled}
      required={isRequired}
      className={cn(
        'elyri-ui-textarea',
        `elyri-ui-textarea--${size}`,
        isInvalid && 'is-invalid',
        autosize && 'elyri-ui-textarea--autosize',
        className,
      )}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      value={value}
      {...rest}
    />
  );
});
