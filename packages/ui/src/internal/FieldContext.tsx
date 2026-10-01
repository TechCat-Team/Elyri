import { createContext, useContext, useEffect } from 'react';

/** Field 向表单控件下发的上下文：id 关联与状态同步 */
export interface FieldContextValue {
  /** 控件应使用的 id；控件上报自定义 id 后会更新为实际值，Field.Label 的 htmlFor 随之指向它 */
  controlId: string;
  /** Field.Label 的 id，供 RadioGroup 等组控件做 aria-labelledby 关联 */
  labelId: string;
  /** 当前已挂载的 description / message id，控件据此合成 aria-describedby */
  describedIds: string[];
  /** Field.Label 是否已挂载：控件据此避免自身文案与外部 label 重复命名 */
  hasLabel: boolean;
  /** Field.Label 挂载时注册自身存在，返回注销函数 */
  registerLabel: () => () => void;
  /** description / message 挂载时注册自身 id，返回注销函数 */
  registerDescription: (id: string) => () => void;
  /** 控件挂载时上报自身实际使用的 id（自定义 id 场景），返回注销函数 */
  registerControlId: (id: string) => () => void;
  /** 校验失败态，驱动控件的 aria-invalid 与红色样式 */
  invalid?: boolean;
  /** 必填态，驱动控件标记必填（原生 required / aria-required）与 Field.Label 的星号 */
  required?: boolean;
  /** 禁用态，控件未显式传 disabled 时生效 */
  disabled?: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * 读取所属 Field 的上下文。不在 `<Field>` 内使用时返回 null，
 * 控件应把它当作独立模式正常工作。
 */
export function useField() {
  return useContext(FieldContext);
}

/**
 * 在 `<Field>` 内时把控件实际使用的 id 上报给 Field，
 * 使 Field.Label 的 htmlFor 在控件传入自定义 id 时依然指向真实节点。
 */
export function useFieldControlId(id?: string) {
  const register = useField()?.registerControlId;
  useEffect(() => {
    if (!register || !id) return;
    return register(id);
  }, [register, id]);
}
