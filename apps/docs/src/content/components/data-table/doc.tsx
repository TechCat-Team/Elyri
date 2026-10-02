import { DataTable, Tag } from '@elyri/ui';
import type { DataTableColumn } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

interface Member {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'paused' | 'invited';
  seats: number;
}

const members: Member[] = [
  { id: 1, name: 'Ada Lovelace', role: 'admin', status: 'active', seats: 3 },
  { id: 2, name: 'Alan Turing', role: 'editor', status: 'active', seats: 2 },
  { id: 3, name: 'Grace Hopper', role: 'admin', status: 'paused', seats: 5 },
  { id: 4, name: 'Linus Torvalds', role: 'viewer', status: 'invited', seats: 1 },
  { id: 5, name: 'Margaret Hamilton', role: 'editor', status: 'active', seats: 4 },
  { id: 6, name: 'Katherine Johnson', role: 'viewer', status: 'invited', seats: 2 },
];

const statusMeta = {
  active: { variant: 'success', label: 'Active' },
  paused: { variant: 'warning', label: 'Paused' },
  invited: { variant: 'neutral', label: 'Invited' },
} as const;

const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Member', accessor: 'name', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role' },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    align: 'center',
    cell: (row) => (
      <Tag size="sm" variant={statusMeta[row.status].variant}>
        {statusMeta[row.status].label}
      </Tag>
    ),
  },
  { id: 'seats', header: 'Seats', accessor: 'seats', sortable: true, align: 'right' },
];

const codeData = `const members = [
  { id: 1, name: 'Ada Lovelace', role: 'admin', status: 'active', seats: 3 },
  { id: 2, name: 'Alan Turing', role: 'editor', status: 'active', seats: 2 },
  { id: 3, name: 'Grace Hopper', role: 'admin', status: 'paused', seats: 5 },
];`;

const codeColumns = `const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Member', accessor: 'name', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role' },
  { id: 'status', header: 'Status', accessor: 'status', align: 'center' },
  { id: 'seats', header: 'Seats', accessor: 'seats', sortable: true, align: 'right' },
];`;

const copy = {
  zh: {
    description:
      '数据表格：列定义驱动，内置排序、全局搜索、分页与行选择，并支持加载骨架与空状态；排序、分页、选择均可受控或非受控。',
    exBasic: '基础用法',
    exBasicDesc: '传入 columns 与 data 即可，accessor 决定取值列，cell 可自定义单元格。',
    exSort: '排序',
    exSortDesc: '列开启 sortable 后点击表头在升序 / 降序 / 取消间循环，aria-sort 同步更新。',
    exSearch: '全局搜索',
    exSearchDesc: '开启 searchable 显示搜索框，对所有可搜索列做忽略大小写的包含匹配。',
    exSelection: '行选择',
    exSelectionDesc: '开启 selectable 出现选择列，表头支持全选当前页与半选态，底部展示已选摘要。',
    exPagination: '分页',
    exPaginationDesc: '通过 pageSize 与 pageSizeOptions 启用分页，支持受控与非受控。',
    exStates: '加载与空状态',
    exStatesDesc: 'loading 渲染骨架行，数据为空时展示内置空状态，也可用 empty 自定义。',
    exAppearance: '外观',
    exAppearanceDesc: 'variant / size / striped / hoverable / stickyHeader 组合出不同密度的表格。',
    descColumns: '列定义数组',
    descData: '数据行数组',
    descGetRowId: '行唯一键，默认取 row.id，缺失时回退到原始下标',
    descTitle: '工具栏左侧标题',
    descCaption: '表格标题（caption）',
    descSort: '受控排序状态，null 表示未排序',
    descDefaultSort: '非受控初始排序状态',
    descOnSortChange: '排序变化回调',
    descSelectable: '显示行选择列',
    descSelectedKeys: '受控选中行 key',
    descDefaultSelectedKeys: '非受控初始选中行 key',
    descOnSelectionChange: '选中行变化回调',
    descSearchable: '工具栏显示全局搜索框',
    descSearch: '受控搜索词',
    descOnSearchChange: '搜索词变化回调',
    descGlobalFilterFn: '自定义全局搜索匹配',
    descPagination: '是否启用分页，默认 true',
    descPage: '受控当前页（从 1 开始）',
    descOnPageChange: '当前页变化回调',
    descPageSize: '每页条数',
    descPageSizeOptions: '每页条数选项，传入后显示选择器',
    descLoading: '加载态，渲染骨架行',
    descLoadingRows: '骨架行数，默认取当前每页条数',
    descEmpty: '自定义空状态内容',
    descVariant: "外观：'outline' | 'plain'",
    descSize: "行内边距与字号：'sm' | 'md' | 'lg'",
    descStriped: '斑马纹',
    descHoverable: '悬停高亮，默认 true',
    descStickyHeader: '表头吸顶（需给容器设置高度或 maxHeight）',
    descToolbar: '工具栏右侧自定义内容',
    descLabels: '覆盖内置文案（搜索、全选、分页等）',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'A data table driven by column definitions with sorting, global search, pagination and row selection, plus loading skeletons and an empty state. Every layer is controllable or uncontrolled.',
    exBasic: 'Basic',
    exBasicDesc: 'Pass columns and data; accessor picks the value, cell customizes a cell.',
    exSort: 'Sorting',
    exSortDesc: 'Mark a column sortable to cycle asc / desc / none on header click, with aria-sort kept in sync.',
    exSearch: 'Global search',
    exSearchDesc: 'Enable searchable to show a box that filters every searchable column, case-insensitively.',
    exSelection: 'Row selection',
    exSelectionDesc: 'Enable selectable for a selection column; the header selects the page with an indeterminate state.',
    exPagination: 'Pagination',
    exPaginationDesc: 'Turn on pagination with pageSize and pageSizeOptions; controlled or uncontrolled.',
    exStates: 'Loading & empty',
    exStatesDesc: 'loading renders skeleton rows; with no data the built-in empty state shows, replaceable via empty.',
    exAppearance: 'Appearance',
    exAppearanceDesc: 'Combine variant / size / striped / hoverable / stickyHeader for different densities.',
    descColumns: 'Column definitions',
    descData: 'Row data',
    descGetRowId: 'Row key; defaults to row.id, falling back to the original index',
    descTitle: 'Toolbar title',
    descCaption: 'Table caption',
    descSort: 'Controlled sort state, null when unsorted',
    descDefaultSort: 'Uncontrolled initial sort state',
    descOnSortChange: 'Sort change handler',
    descSelectable: 'Show a selection column',
    descSelectedKeys: 'Controlled selected row keys',
    descDefaultSelectedKeys: 'Uncontrolled initial selected row keys',
    descOnSelectionChange: 'Selection change handler',
    descSearchable: 'Show a global search box in the toolbar',
    descSearch: 'Controlled search query',
    descOnSearchChange: 'Search change handler',
    descGlobalFilterFn: 'Custom global search matcher',
    descPagination: 'Enable pagination, defaults to true',
    descPage: 'Controlled current page (1-based)',
    descOnPageChange: 'Page change handler',
    descPageSize: 'Rows per page',
    descPageSizeOptions: 'Page size options; renders a selector when provided',
    descLoading: 'Loading state, renders skeleton rows',
    descLoadingRows: 'Skeleton row count, defaults to the current page size',
    descEmpty: 'Custom empty state',
    descVariant: "Appearance: 'outline' | 'plain'",
    descSize: "Padding and font size: 'sm' | 'md' | 'lg'",
    descStriped: 'Zebra stripes',
    descHoverable: 'Highlight on hover, defaults to true',
    descStickyHeader: 'Sticky header (give the container a height or maxHeight)',
    descToolbar: 'Extra toolbar content on the right',
    descLabels: 'Override built-in labels (search, select-all, pagination, …)',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const dataTableDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'data-table',
    title: 'DataTable',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'columns', type: 'DataTableColumn<T>[]', description: t.descColumns },
      { name: 'data', type: 'T[]', description: t.descData },
      { name: 'getRowId', type: '(row, index) => string', description: t.descGetRowId },
      { name: 'title', type: 'ReactNode', description: t.descTitle },
      { name: 'caption', type: 'ReactNode', description: t.descCaption },
      { name: 'sort', type: 'DataTableSortState | null', description: t.descSort },
      { name: 'defaultSort', type: 'DataTableSortState | null', description: t.descDefaultSort },
      { name: 'onSortChange', type: '(sort) => void', description: t.descOnSortChange },
      { name: 'selectable', type: 'boolean', default: 'false', description: t.descSelectable },
      { name: 'selectedKeys', type: 'string[]', description: t.descSelectedKeys },
      { name: 'defaultSelectedKeys', type: 'string[]', description: t.descDefaultSelectedKeys },
      { name: 'onSelectionChange', type: '(keys) => void', description: t.descOnSelectionChange },
      { name: 'searchable', type: 'boolean', default: 'false', description: t.descSearchable },
      { name: 'search', type: 'string', description: t.descSearch },
      { name: 'onSearchChange', type: '(value) => void', description: t.descOnSearchChange },
      { name: 'globalFilterFn', type: '(row, query) => boolean', description: t.descGlobalFilterFn },
      { name: 'pagination', type: 'boolean', default: 'true', description: t.descPagination },
      { name: 'page', type: 'number', description: t.descPage },
      { name: 'onPageChange', type: '(page) => void', description: t.descOnPageChange },
      { name: 'pageSize', type: 'number', default: '10', description: t.descPageSize },
      { name: 'pageSizeOptions', type: 'number[]', description: t.descPageSizeOptions },
      { name: 'loading', type: 'boolean', default: 'false', description: t.descLoading },
      { name: 'loadingRows', type: 'number', description: t.descLoadingRows },
      { name: 'empty', type: 'ReactNode', description: t.descEmpty },
      { name: 'variant', type: "'outline' | 'plain'", default: "'outline'", description: t.descVariant },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'striped', type: 'boolean', default: 'false', description: t.descStriped },
      { name: 'hoverable', type: 'boolean', default: 'true', description: t.descHoverable },
      { name: 'stickyHeader', type: 'boolean', default: 'false', description: t.descStickyHeader },
      { name: 'toolbar', type: 'ReactNode', description: t.descToolbar },
      { name: 'labels', type: 'Partial<DataTableLabels>', description: t.descLabels },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    showcase: () => (
      <DataTable
        columns={[
          { id: 'name', header: 'Member', accessor: 'name', sortable: true },
          { id: 'seats', header: 'Seats', accessor: 'seats', align: 'right' },
        ]}
        data={members.slice(0, 3)}
        size="sm"
        style={{ width: 'min(360px, 100%)' }}
      />
    ),
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => <DataTable caption="Workspace members" columns={columns} data={members} />,
        code: `import { DataTable } from './components/elyri/DataTable';
import type { DataTableColumn } from './components/elyri/DataTable';

interface Member {
  id: number;
  name: string;
  role: string;
  status: string;
  seats: number;
}

${codeData}

${codeColumns}

export function Example() {
  return <DataTable caption="Workspace members" columns={columns} data={members} />;
}`,
      },
      {
        title: t.exSort,
        description: t.exSortDesc,
        render: () => (
          <DataTable
            columns={columns}
            data={members}
            defaultSort={{ columnId: 'seats', direction: 'desc' }}
          />
        ),
        code: `import { DataTable } from './components/elyri/DataTable';

export function Example() {
  return (
    <DataTable
      columns={columns}
      data={members}
      defaultSort={{ columnId: 'seats', direction: 'desc' }}
    />
  );
}`,
      },
      {
        title: t.exSearch,
        description: t.exSearchDesc,
        render: () => (
          <DataTable searchable title="Members" columns={columns} data={members} />
        ),
        code: `import { DataTable } from './components/elyri/DataTable';

export function Example() {
  return <DataTable searchable title="Members" columns={columns} data={members} />;
}`,
      },
      {
        title: t.exSelection,
        description: t.exSelectionDesc,
        wide: true,
        render: () => (
          <DataTable
            selectable
            columns={columns}
            data={members}
            defaultSelectedKeys={['1']}
            pageSizeOptions={[3, 6]}
            defaultPageSize={3}
          />
        ),
        code: `import { DataTable } from './components/elyri/DataTable';

export function Example() {
  return (
    <DataTable
      selectable
      columns={columns}
      data={members}
      defaultSelectedKeys={['1']}
      pageSizeOptions={[3, 6]}
      defaultPageSize={3}
    />
  );
}`,
      },
      {
        title: t.exPagination,
        description: t.exPaginationDesc,
        wide: true,
        render: () => (
          <DataTable
            columns={columns}
            data={members}
            pageSize={3}
            pageSizeOptions={[3, 6]}
          />
        ),
        code: `import { DataTable } from './components/elyri/DataTable';

export function Example() {
  return (
    <DataTable columns={columns} data={members} pageSize={3} pageSizeOptions={[3, 6]} />
  );
}`,
      },
      {
        title: t.exStates,
        description: t.exStatesDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <DataTable loading columns={columns} data={[]} loadingRows={3} />
            <DataTable columns={columns} data={[]} />
          </div>
        ),
        code: `import { DataTable } from './components/elyri/DataTable';

export function Example() {
  return (
    <>
      <DataTable loading columns={columns} data={[]} loadingRows={3} />
      <DataTable columns={columns} data={[]} />
    </>
  );
}`,
      },
      {
        title: t.exAppearance,
        description: t.exAppearanceDesc,
        wide: true,
        render: () => (
          <div className="demo-ui-stack">
            <DataTable size="sm" striped columns={columns} data={members.slice(0, 3)} />
            <DataTable variant="plain" hoverable columns={columns} data={members.slice(0, 3)} />
          </div>
        ),
        code: `import { DataTable } from './components/elyri/DataTable';

export function Example() {
  return (
    <>
      <DataTable size="sm" striped columns={columns} data={members} />
      <DataTable variant="plain" hoverable columns={columns} data={members} />
    </>
  );
}`,
      },
    ],
  };
};
