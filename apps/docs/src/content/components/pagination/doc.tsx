import { useState } from 'react';

import { Pagination } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const DEFAULTS = {
  siblingCount: 1,
  boundaryCount: 1,
  showEdges: false,
  variant: 'outline',
  size: 'md',
  showJump: false,
};

/** 完整版演示：每页条数联动总页数，切页大小时回到第一页 */
function FullDemo() {
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 97;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <Pagination
      total={totalPages}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 50]}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      showEdges
      showJump
    />
  );
}

/** 两种外观共享同一个当前页，方便对照 */
function VariantsDemo() {
  const [page, setPage] = useState(4);

  return (
    <div className="demo-ui-stack">
      <Pagination total={20} page={page} onPageChange={setPage} variant="outline" showEdges />
      <Pagination total={20} page={page} onPageChange={setPage} variant="filled" showEdges />
    </div>
  );
}

/** 两档尺寸共用一个当前页 */
function SizesDemo() {
  const [page, setPage] = useState(3);

  return (
    <div className="demo-ui-stack">
      <Pagination total={10} page={page} onPageChange={setPage} size="sm" />
      <Pagination total={10} page={page} onPageChange={setPage} size="md" />
    </div>
  );
}

const copy = {
  zh: {
    description: '分页：受控 / 非受控双支持，页码区间自动折叠，可选每页条数选择器与跳转输入框，描边 / 填充两种外观。',
    exBasic: '基础用法',
    exBasicDesc: '默认描边外观，首尾页数超出时自动用省略号折叠中间区间。',
    exFull: '完整版',
    exFullDesc: '叠加每页条数选择器与首尾页按钮，页码由总条数除以每页条数推导。',
    exVariants: '外观',
    exVariantsDesc: '两种外观都是无边框幽灵按钮，仅当前页的高亮方式不同。',
    exSizes: '尺寸',
    exSizesDesc: '两档尺寸：sm / md。',
    exEllipsis: '区间折叠',
    exEllipsisDesc: '当前页两侧各展开 1 个页码，其余折叠，100 页也能保持精简。',
    descTotal: '总页数',
    descPage: '受控当前页（从 1 开始）',
    descDefaultPage: '非受控初始页',
    descOnPageChange: '当前页变化回调，受控与非受控都会触发',
    descSiblingCount: '当前页两侧各展开的页码数',
    descBoundaryCount: '首尾各固定展示的页码数',
    descShowEdges: '是否显示首页 / 末页按钮',
    descVariant: '外观：outline（当前页主色描边 + 淡底）/ filled（当前页实心主色）',
    descSize: '控件尺寸：sm / md',
    descDisabled: '禁用整组交互',
    descPageSize: '受控每页条数，需配合 pageSizeOptions 显示选择器',
    descDefaultPageSize: '非受控初始每页条数，默认取 pageSizeOptions 第一项',
    descPageSizeOptions: '每页条数选项，传入后显示选择器',
    descOnPageSizeChange: '每页条数变化回调',
    descShowJump: '是否显示跳转到指定页的输入框',
    descLabels: '覆盖内置文案（无障碍标签与提示）',
    descRest: '其余属性透传给原生 nav',
  },
  en: {
    description:
      'Pagination with controlled and uncontrolled modes, automatic range collapsing, an optional page-size selector and jump input, and outline / filled looks.',
    exBasic: 'Basic',
    exBasicDesc: 'The default outline look; the middle range collapses into an ellipsis once edges overflow.',
    exFull: 'Full',
    exFullDesc: 'Adds a page-size selector and first / last buttons; pages derive from total items over page size.',
    exVariants: 'Variants',
    exVariantsDesc: 'Both looks use borderless ghost buttons; only the active-page highlight differs.',
    exSizes: 'Sizes',
    exSizesDesc: 'Two sizes: sm / md.',
    exEllipsis: 'Range collapsing',
    exEllipsisDesc: 'One sibling on each side of the current page; even 100 pages stay compact.',
    descTotal: 'Total number of pages',
    descPage: 'Controlled current page (1-based)',
    descDefaultPage: 'Initial page when uncontrolled',
    descOnPageChange: 'Called on every change, controlled or not',
    descSiblingCount: 'Number of pages shown on each side of the current page',
    descBoundaryCount: 'Number of pages pinned at the first and last ends',
    descShowEdges: 'Whether the first / last buttons show',
    descVariant: 'Appearance: outline (accent outline + tint on the current page) or filled (solid accent)',
    descSize: 'Control size: sm / md',
    descDisabled: 'Disable the whole control',
    descPageSize: 'Controlled page size; the selector shows when pageSizeOptions is set',
    descDefaultPageSize: 'Initial page size when uncontrolled, defaults to the first option',
    descPageSizeOptions: 'Page-size options; the selector shows once provided',
    descOnPageSizeChange: 'Called when the page size changes',
    descShowJump: 'Whether the jump-to-page input shows',
    descLabels: 'Override built-in copy (aria labels and hints)',
    descRest: 'Remaining props are forwarded to the native nav',
  },
};

export const paginationDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'pagination',
    title: 'Pagination',
    category: 'Navigation',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'total', type: 'number', description: t.descTotal },
      { name: 'page', type: 'number', description: t.descPage },
      { name: 'defaultPage', type: 'number', default: '1', description: t.descDefaultPage },
      { name: 'onPageChange', type: '(page: number) => void', description: t.descOnPageChange },
      {
        name: 'siblingCount',
        type: 'number',
        default: `'${DEFAULTS.siblingCount}'`,
        description: t.descSiblingCount,
      },
      {
        name: 'boundaryCount',
        type: 'number',
        default: `'${DEFAULTS.boundaryCount}'`,
        description: t.descBoundaryCount,
      },
      { name: 'showEdges', type: 'boolean', default: `${DEFAULTS.showEdges}`, description: t.descShowEdges },
      {
        name: 'variant',
        type: "'outline' | 'filled'",
        default: `'${DEFAULTS.variant}'`,
        description: t.descVariant,
      },
      { name: 'size', type: "'sm' | 'md'", default: `'${DEFAULTS.size}'`, description: t.descSize },
      { name: 'disabled', type: 'boolean', default: 'false', description: t.descDisabled },
      { name: 'pageSize', type: 'number', description: t.descPageSize },
      { name: 'defaultPageSize', type: 'number', description: t.descDefaultPageSize },
      { name: 'pageSizeOptions', type: 'number[]', description: t.descPageSizeOptions },
      { name: 'onPageSizeChange', type: '(pageSize: number) => void', description: t.descOnPageSizeChange },
      { name: 'showJump', type: 'boolean', default: `${DEFAULTS.showJump}`, description: t.descShowJump },
      { name: 'labels', type: 'Partial<PaginationLabels>', description: t.descLabels },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <Pagination total={12} defaultPage={1} />,
        code: `import { Pagination } from './components/elyri/Pagination';

export function Example() {
  return <Pagination total={12} defaultPage={1} />;
}`,
      },
      {
        title: t.exFull,
        description: t.exFullDesc,
        wide: true,
        render: () => <FullDemo />,
        code: `import { useState } from 'react';
import { Pagination } from './components/elyri/Pagination';

export function Example() {
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 97;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <Pagination
      total={totalPages}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 50]}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      showEdges
      showJump
    />
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        wide: true,
        render: () => <VariantsDemo />,
        code: `import { useState } from 'react';
import { Pagination } from './components/elyri/Pagination';

export function Example() {
  const [page, setPage] = useState(4);

  return (
    <div className="demo-ui-stack">
      <Pagination total={20} page={page} onPageChange={setPage} variant="outline" showEdges />
      <Pagination total={20} page={page} onPageChange={setPage} variant="filled" showEdges />
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => <SizesDemo />,
        code: `import { useState } from 'react';
import { Pagination } from './components/elyri/Pagination';

export function Example() {
  const [page, setPage] = useState(3);

  return (
    <div className="demo-ui-stack">
      <Pagination total={10} page={page} onPageChange={setPage} size="sm" />
      <Pagination total={10} page={page} onPageChange={setPage} size="md" />
    </div>
  );
}`,
      },
      {
        title: t.exEllipsis,
        description: t.exEllipsisDesc,
        wide: true,
        render: () => <Pagination total={100} defaultPage={50} showEdges />,
        code: `import { Pagination } from './components/elyri/Pagination';

export function Example() {
  return <Pagination total={100} defaultPage={50} showEdges />;
}`,
      },
    ],
  };
};
