import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';

import { FieldContext, cn, useField } from '../../../core';

import './Field.css';

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** 校验失败态：控件红框 + aria-invalid，message 文案建议仅在失败时渲染 */
  invalid?: boolean;
  /** 必填态：无原生 required 属性的控件（如 Select）标记 aria-required */
  required?: boolean;
  /** 禁用态：控件未显式传 disabled 时生效 */
  disabled?: boolean;
  children?: ReactNode;
}

/** 表单域：统一 label / 控件 / 描述 / 错误信息的排版与 aria 关联 */
function FieldRoot({ invalid, required, disabled, className, children, ...rest }: FieldProps) {
  const baseId = useId();
  const generatedControlId = `${baseId}--control`;
  const labelId = `${baseId}--label`;
  const [controlId, setControlId] = useState(generatedControlId);
  const [describedIds, setDescribedIds] = useState<string[]>([]);
  const [hasLabel, setHasLabel] = useState(false);

  const registerLabel = useCallback(() => {
    setHasLabel(true);
    return () => setHasLabel(false);
  }, []);

  const registerDescription = useCallback((id: string) => {
    setDescribedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => setDescribedIds((prev) => prev.filter((item) => item !== id));
  }, []);

  // 控件上报自身实际 id（自定义 id 时覆盖生成值），卸载后回退到生成值
  const registerControlId = useCallback(
    (id: string) => {
      setControlId(id);
      return () => setControlId(generatedControlId);
    },
    [generatedControlId],
  );

  const value = useMemo(
    () => ({
      controlId,
      labelId,
      describedIds,
      hasLabel,
      registerLabel,
      registerDescription,
      registerControlId,
      invalid,
      required,
      disabled,
    }),
    [
      controlId,
      labelId,
      describedIds,
      hasLabel,
      registerLabel,
      registerDescription,
      registerControlId,
      invalid,
      required,
      disabled,
    ],
  );

  return (
    <FieldContext.Provider value={value}>
      <div
        className={cn('elyri-ui-field', className)}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

function FieldLabel({ className, id, htmlFor, children, ...rest }: FieldLabelProps) {
  const field = useField();
  const registerLabel = field?.registerLabel;
  // 告知 Field 自身已存在，控件据此避免与外层 label 重复命名
  useEffect(() => registerLabel?.(), [registerLabel]);

  return (
    <label
      // 显式 id / htmlFor 优先，否则指向 Field 生成的控件 id
      id={id ?? field?.labelId}
      className={cn('elyri-ui-field__label', className)}
      htmlFor={htmlFor ?? field?.controlId}
      {...rest}
    >
      {children}
      {field?.required && (
        <span className="elyri-ui-field__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export interface FieldDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  /** 覆盖自动生成的 id（例如跨组件引用描述文案时） */
  id?: string;
}

function FieldDescription({ className, id, ...rest }: FieldDescriptionProps) {
  const generated = useId();
  const descriptionId = id ?? `${generated}--description`;
  const register = useField()?.registerDescription;

  // 挂载即注册、卸载即注销，保证 aria-describedby 只指向真实存在的节点
  useEffect(() => register?.(descriptionId), [register, descriptionId]);

  return <p className={cn('elyri-ui-field__description', className)} id={descriptionId} {...rest} />;
}

export interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  /** 覆盖自动生成的 id */
  id?: string;
}

/** 校验错误信息：建议配合 `{error && <Field.Message>{error}</Field.Message>}` 条件渲染 */
function FieldMessage({ className, id, ...rest }: FieldMessageProps) {
  const generated = useId();
  const messageId = id ?? `${generated}--message`;
  const register = useField()?.registerDescription;

  useEffect(() => register?.(messageId), [register, messageId]);

  return <p className={cn('elyri-ui-field__message', className)} id={messageId} {...rest} />;
}

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Message: FieldMessage,
});
