import { createContext, useContext } from 'react';

import type { AvatarShape, AvatarSize } from './Avatar';

/** AvatarGroup 向子 Avatar 下发的默认尺寸与形状，供未显式传参的头像继承 */
export interface AvatarGroupContextValue {
  size?: AvatarSize;
  shape?: AvatarShape;
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export function useAvatarGroup() {
  return useContext(AvatarGroupContext);
}
