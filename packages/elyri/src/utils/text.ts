export type SplitTextBy = 'char' | 'word';

export interface SplitTextUnit {
  char: string;
  index: number;
}

export type SplitTextSegment =
  { kind: 'space'; key: string; value: string } | { kind: 'word'; key: string; units: SplitTextUnit[] };

/** 按空白切分文本，保留空白片段，并为每个动画单元分配全局序号 */
export const splitTextUnits = (text: string, by: SplitTextBy): SplitTextSegment[] => {
  let index = 0;

  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part, partIndex) => {
      if (/^\s+$/.test(part)) return { kind: 'space' as const, key: `space-${partIndex}`, value: part };

      const units = by === 'char' ? Array.from(part) : [part];

      return {
        kind: 'word' as const,
        key: `word-${partIndex}`,
        units: units.map((char) => ({ char, index: index++ })),
      };
    });
};
