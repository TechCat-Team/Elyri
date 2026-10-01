import { useEffect, useState } from 'react';

/**
 * 让浮层在关闭后多保留 exitDuration 毫秒，供离场动画播放。
 * 返回 true 期间应继续渲染，并用 open 决定 data-state。
 */
export function usePresence(open: boolean, exitDuration: number) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  useEffect(() => {
    if (open || !present) return;
    const timer = setTimeout(() => setPresent(false), exitDuration);
    return () => clearTimeout(timer);
  }, [open, present, exitDuration]);

  return present;
}
