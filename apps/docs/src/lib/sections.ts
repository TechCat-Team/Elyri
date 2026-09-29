import type { MessageKey } from './messages';
import type { ComponentDoc, Pkg } from './types';

export interface Section {
  id: Pkg;
  /** 分区落地页的站内路径，不含语言段 */
  path: string;
  labelKey: MessageKey;
  descriptionKey: MessageKey;
}

/** 顶层分区。动效沿用既有的 /components 路径（已被搜索引擎收录，不迁移）。 */
export const sections: readonly Section[] = [
  { id: 'motion', path: 'components', labelKey: 'section.motion', descriptionKey: 'section.motion.desc' },
  { id: 'ui', path: 'ui', labelKey: 'section.ui', descriptionKey: 'section.ui.desc' },
  { id: 'blocks', path: 'blocks', labelKey: 'section.blocks', descriptionKey: 'section.blocks.desc' },
];

export const sectionById = (id: Pkg): Section => sections.find((section) => section.id === id) ?? sections[0];

/** 按站内路径前缀匹配分区；首页、安装等引导页不属于任何分区 */
export const sectionByPath = (path: string): Section | undefined =>
  sections.find((section) => path === section.path || path.startsWith(`${section.path}/`));

/** 文档所属分区，未标注的一律算动效 */
export const docPkg = (doc: ComponentDoc): Pkg => doc.pkg ?? 'motion';

/** 组件文档的站内路径，按所属分区加前缀 */
export const docPath = (doc: ComponentDoc) => `${sectionById(docPkg(doc)).path}/${doc.slug}`;
