import type { ComponentDoc, Lang } from '../lib/types';

import { auroraDoc } from './components/aurora';
import { causticsDoc } from './components/caustics';
import { countUpDoc } from './components/count-up';
import { dragonScalesDoc } from './components/dragon-scales';
import { fadeInDoc } from './components/fade-in';
import { gradientTextDoc } from './components/gradient-text';
import { particleTextDoc } from './components/particle-text';
import { pixelVortexDoc } from './components/pixel-vortex';
import { scaleInDoc } from './components/scale-in';
import { scrambleTextDoc } from './components/scramble-text';
import { scrollMarqueeDoc } from './components/scroll-marquee';
import { silkWavesDoc } from './components/silk-waves';
import { splitRevealDoc } from './components/split-reveal';
import { tiltDoc } from './components/tilt';
import { typewriterDoc } from './components/typewriter';

/**
 * 全部组件文档。新增组件只需在 components 下建一个文件夹，
 * 然后把它的 doc 加到这里，侧边栏、搜索、翻页会自动带上。
 */
export const getDocs = (lang: Lang): ComponentDoc[] => [
  gradientTextDoc(lang),
  splitRevealDoc(lang),
  typewriterDoc(lang),
  scrambleTextDoc(lang),
  particleTextDoc(lang),
  scrollMarqueeDoc(lang),
  fadeInDoc(lang),
  scaleInDoc(lang),
  countUpDoc(lang),
  tiltDoc(lang),
  dragonScalesDoc(lang),
  auroraDoc(lang),
  silkWavesDoc(lang),
  causticsDoc(lang),
  pixelVortexDoc(lang),
];

export const getCategories = (docs: ComponentDoc[]) => [...new Set(docs.map((doc) => doc.category))];
