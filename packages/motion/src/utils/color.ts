export type LinearRgb = [number, number, number];

/** hex（#rgb / #rrggbb）转线性空间 RGB，供着色器在线性空间计算光照 */
export function hexToLinearRgb(hex: string): LinearRgb {
  let value = hex.replace('#', '');
  if (value.length === 3) value = [...value].map((char) => char + char).join('');
  const int = parseInt(value.slice(0, 6), 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((channel) => (channel / 255) ** 2.2) as LinearRgb;
}
