export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const toRgb = (hex: string): RGB => {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  const int = Number.parseInt(full, 16) || 0;
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

export const toHex = ({ r, g, b }: RGB) =>
  `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;

export const rgbToHsv = ({ r, g, b }: RGB): HSV => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let hue = 0;
  if (delta) {
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
  }

  return { h: Math.round((hue * 60 + 360) % 360), s: max ? delta / max : 0, v: max };
};

export const hsvToRgb = ({ h, s, v }: HSV): RGB => {
  const chroma = v * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - chroma;
  const segments: Array<[number, number, number]> = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ];
  const [rp, gp, bp] = segments[Math.floor(h / 60) % 6];
  return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
};

/** 支持 #RGB、#RRGGBB 以及 255,155,255 / rgb(255,155,255) */
export const parseColor = (input: string): string | null => {
  const hex = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex) || /^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toLowerCase()}`;

  const numbers = input.match(/\d{1,3}/g);
  if (numbers?.length === 3 && numbers.every((value) => Number(value) <= 255)) {
    const [r, g, b] = numbers.map(Number);
    return toHex({ r, g, b });
  }

  return null;
};
