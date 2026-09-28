import type { ComponentDoc, Lang } from '../lib/types';

import { dragonScalesDoc } from './components/dragon-scales';
import { fadeInDoc } from './components/fade-in';
import { gradientTextDoc } from './components/gradient-text';

/**
 * 全部组件文档。新增组件只需在 components 下建一个文件夹，
 * 然后把它的 doc 加到这里，侧边栏、搜索、翻页会自动带上。
 */
export const getDocs = (lang: Lang): ComponentDoc[] => [gradientTextDoc(lang), fadeInDoc(lang), dragonScalesDoc(lang)];

export const getCategories = (docs: ComponentDoc[]) => [...new Set(docs.map((doc) => doc.category))];
