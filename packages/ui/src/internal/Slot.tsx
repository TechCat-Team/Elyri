import { Children, cloneElement, forwardRef, isValidElement, version } from 'react';
import type { CSSProperties, HTMLAttributes, ReactElement, Ref } from 'react';

import { cn } from '../utils/cn';

type AnyProps = Record<string, unknown>;

const IS_REACT_19 = Number(version.split('.')[0]) >= 19;

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

/** React 19 把 ref 放进 props，18 挂在元素上；按版本取值，避免 19 下访问 element.ref 的告警 */
function getElementRef(element: ReactElement): Ref<unknown> | undefined {
  return IS_REACT_19
    ? ((element.props as AnyProps).ref as Ref<unknown> | undefined)
    : (element as unknown as { ref?: Ref<unknown> }).ref;
}

/**
 * asChild 的实现：不渲染自身，把 props 合并到唯一子元素上。
 * className 拼接、style 浅合并、事件处理器先子后己（子元素可 preventDefault 阻止默认行为），ref 同时转发。
 */
export const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Slot({ children, ...slotProps }, ref) {
  const child = Children.only(children);
  if (!isValidElement(child)) return null;

  const childProps = child.props as AnyProps;
  const merged: AnyProps = { ...slotProps, ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = (slotProps as AnyProps)[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        childValue(...args);
        slotValue(...args);
      };
    } else if (key === 'className') {
      merged.className = cn(slotValue as string, childValue as string);
    } else if (key === 'style') {
      merged.style = { ...(slotValue as CSSProperties), ...(childValue as CSSProperties) };
    }
  }

  const childRef = getElementRef(child);
  merged.ref = (node: HTMLElement | null) => {
    setRef(ref, node);
    setRef(childRef, node);
  };

  return cloneElement(child, merged);
});
