import { docPkg } from '../lib/sections';
import type { ComponentDoc, Lang, Pkg } from '../lib/types';

import { auroraDoc } from './components/aurora';
import { asciiImageDoc } from './components/ascii-image';
import { causticsDoc } from './components/caustics';
import { contoursDoc } from './components/contours';
import { countUpDoc } from './components/count-up';
import { dotFieldDoc } from './components/dot-field';
import { dragonScalesDoc } from './components/dragon-scales';
import { fadeInDoc } from './components/fade-in';
import { filamentsDoc } from './components/filaments';
import { flipTilesDoc } from './components/flip-tiles';
import { gradientTextDoc } from './components/gradient-text';
import { haloDoc } from './components/halo';
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
import { scrollRevealDoc } from './components/scroll-reveal';
import { silkWavesDoc } from './components/silk-waves';
import { splitRevealDoc } from './components/split-reveal';
import { spotlightDoc } from './components/spotlight';
import { tiltDoc } from './components/tilt';
import { typewriterDoc } from './components/typewriter';
import { velvetDoc } from './components/velvet';
import { waveTextDoc } from './components/wave-text';

// @elyri/ui 组件文档
import { alertDoc } from './components/alert';
import { badgeDoc } from './components/badge';
import { buttonDoc } from './components/button';
import { buttonGroupDoc } from './components/button-group';
import { cardDoc } from './components/card';
import { checkboxDoc } from './components/checkbox';
import { dialogDoc } from './components/dialog';
import { dropdownMenuDoc } from './components/dropdown-menu';
import { fieldDoc } from './components/field';
import { inputDoc } from './components/input';
import { numberInputDoc } from './components/number-input';
import { popoverDoc } from './components/popover';
import { progressDoc } from './components/progress';
import { radioDoc } from './components/radio';
import { selectDoc } from './components/select';
import { sliderDoc } from './components/slider';
import { switchDoc } from './components/switch';
import { tabsDoc } from './components/tabs';
import { textareaDoc } from './components/textarea';
import { toastDoc } from './components/toast';
import { tooltipDoc } from './components/tooltip';

/**
 * 全部组件文档。新增组件只需在 components 下建一个文件夹，
 * 然后把它的 doc 加到这里，侧边栏、搜索、翻页会自动带上。
 * 分类顺序按首次出现固定，分类内一律按组件名 A–Z 排序。
 */
export const getDocs = (lang: Lang): ComponentDoc[] => {
  const docs = [
    gradientTextDoc(lang),
    splitRevealDoc(lang),
    typewriterDoc(lang),
    scrambleTextDoc(lang),
    particleTextDoc(lang),
    scrollMarqueeDoc(lang),
    scrollRevealDoc(lang),
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
    velvetDoc(lang),
    planetDoc(lang),
    pixelVortexDoc(lang),
    morphGridDoc(lang),
    meshGradientDoc(lang),
    dotFieldDoc(lang),
    contoursDoc(lang),
    filamentsDoc(lang),
    flipTilesDoc(lang),
    haloDoc(lang),
    asciiImageDoc(lang),
    buttonDoc(lang),
    buttonGroupDoc(lang),
    inputDoc(lang),
    numberInputDoc(lang),
    switchDoc(lang),
    checkboxDoc(lang),
    radioDoc(lang),
    selectDoc(lang),
    sliderDoc(lang),
    textareaDoc(lang),
    fieldDoc(lang),
    badgeDoc(lang),
    cardDoc(lang),
    tabsDoc(lang),
    alertDoc(lang),
    progressDoc(lang),
    toastDoc(lang),
    dialogDoc(lang),
    tooltipDoc(lang),
    popoverDoc(lang),
    dropdownMenuDoc(lang),
  ];

  const categoryOrder = [...new Set(docs.map((doc) => doc.category))];
  return docs.sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.title.localeCompare(b.title),
  );
};

export const getCategories = (docs: ComponentDoc[]) => [...new Set(docs.map((doc) => doc.category))];

/** 某个分区下的全部组件 */
export const getSectionDocs = (lang: Lang, pkg: Pkg, docs = getDocs(lang)) => docs.filter((doc) => docPkg(doc) === pkg);
