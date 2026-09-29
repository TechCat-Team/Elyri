import type { ComponentDoc, Lang } from '../lib/types';

import { auroraDoc } from './components/aurora';
import { asciiImageDoc } from './components/ascii-image';
import { brushedMetalDoc } from './components/brushed-metal';
import { causticsDoc } from './components/caustics';
import { contoursDoc } from './components/contours';
import { countUpDoc } from './components/count-up';
import { dotFieldDoc } from './components/dot-field';
import { dragonScalesDoc } from './components/dragon-scales';
import { fadeInDoc } from './components/fade-in';
import { filamentsDoc } from './components/filaments';
import { gradientTextDoc } from './components/gradient-text';
import { liquidMetalDoc } from './components/liquid-metal';
import { magneticDoc } from './components/magnetic';
import { marqueeDoc } from './components/marquee';
import { meshGradientDoc } from './components/mesh-gradient';
import { morphGridDoc } from './components/morph-grid';
import { particleTextDoc } from './components/particle-text';
import { pixelVortexDoc } from './components/pixel-vortex';
import { planetDoc } from './components/planet';
import { rotatingTextDoc } from './components/rotating-text';
import { scaleInDoc } from './components/scale-in';
import { scrambleTextDoc } from './components/scramble-text';
import { scrollMarqueeDoc } from './components/scroll-marquee';
import { silkWavesDoc } from './components/silk-waves';
import { splitRevealDoc } from './components/split-reveal';
import { spotlightDoc } from './components/spotlight';
import { tiltDoc } from './components/tilt';
import { typewriterDoc } from './components/typewriter';
import { velvetDoc } from './components/velvet';
import { waveTextDoc } from './components/wave-text';

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
  marqueeDoc(lang),
  rotatingTextDoc(lang),
  waveTextDoc(lang),
  fadeInDoc(lang),
  scaleInDoc(lang),
  countUpDoc(lang),
  tiltDoc(lang),
  magneticDoc(lang),
  spotlightDoc(lang),
  dragonScalesDoc(lang),
  auroraDoc(lang),
  silkWavesDoc(lang),
  causticsDoc(lang),
  liquidMetalDoc(lang),
  velvetDoc(lang),
  brushedMetalDoc(lang),
  planetDoc(lang),
  pixelVortexDoc(lang),
  morphGridDoc(lang),
  meshGradientDoc(lang),
  dotFieldDoc(lang),
  contoursDoc(lang),
  filamentsDoc(lang),
  asciiImageDoc(lang),
];

export const getCategories = (docs: ComponentDoc[]) => [...new Set(docs.map((doc) => doc.category))];
