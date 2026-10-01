export type StatusIconVariant = 'info' | 'success' | 'warning' | 'danger';

/** 外圈（info / success / danger 共用）。用 path 而非 circle，便于配合 pathLength 做描边动画 */
export const STATUS_RING_PATH = 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18';

/** warning 的三角外框 */
export const STATUS_TRIANGLE_PATH =
  'M10.3 4.3 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z';

/** 外框内部的符号 */
export const STATUS_GLYPH_PATHS: Record<StatusIconVariant, string> = {
  info: 'M12 11v5M12 8h.01',
  success: 'm8.5 12.5 2.5 2.5 4.5-5',
  warning: 'M12 10v4M12 17h.01',
  danger: 'm9.5 9.5 5 5M14.5 9.5l-5 5',
};

/** 语义状态图标（信息 / 成功 / 警告 / 危险），线性风格，颜色继承 currentColor */
export function StatusIcon({ variant, size = 18 }: { variant: StatusIconVariant; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={variant === 'warning' ? STATUS_TRIANGLE_PATH : STATUS_RING_PATH} />
      <path d={STATUS_GLYPH_PATHS[variant]} />
    </svg>
  );
}
