import { useMemo } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn, useControllableState } from '../../../core';
import { Checkbox } from '../../forms/Checkbox';
import { Pagination } from '../../navigation/Pagination';

import './DataTable.css';

export type DataTableSize = 'sm' | 'md' | 'lg';
export type DataTableVariant = 'outline' | 'plain';
export type DataTableAlign = 'left' | 'center' | 'right';
export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableSortState {
  /** 参与排序的列 id */
  columnId: string;
  /** 排序方向 */
  direction: DataTableSortDirection;
}

export interface DataTableColumn<T> {
  /** 列唯一标识，同时作为排序、筛选状态的键 */
  id: string;
  /** 表头内容 */
  header: ReactNode;
  /** 取值：字段名或访问函数；缺省时该列不参与排序、筛选与全局搜索 */
  accessor?: keyof T | ((row: T) => unknown);
  /** 自定义单元格渲染 */
  cell?: (row: T, rowIndex: number) => ReactNode;
  /** 允许点击表头排序 */
  sortable?: boolean;
  /** 自定义排序规则，默认按 accessor 取值比较 */
  sortFn?: (a: T, b: T) => number;
  /** 对齐方式，默认 left */
  align?: DataTableAlign;
  /** 列宽 */
  width?: number | string;
  /** 是否参与全局搜索，默认 true */
  searchable?: boolean;
}

export interface DataTableLabels {
  /** 全局搜索框的无障碍名称 */
  search: string;
  searchPlaceholder: string;
  /** 表头全选框的无障碍名称 */
  selectAll: string;
  /** 单行复选框的无障碍名称 */
  selectRow: (rowNumber: number) => string;
  /** 已选行数文案 */
  selectedCount: (count: number) => string;
  clearSelection: string;
  empty: string;
  /** 分页导航的无障碍名称 */
  pagination: string;
  previous: string;
  next: string;
  /** 页码按钮的无障碍名称 */
  page: (page: number) => string;
  /** 每页条数选择器前置文案 */
  pageSize: string;
  pageSizeOption: (pageSize: number) => string;
}

const DEFAULT_LABELS: DataTableLabels = {
  search: '搜索',
  searchPlaceholder: '搜索…',
  selectAll: '全选本页',
  selectRow: (rowNumber) => `选择第 ${rowNumber} 行`,
  selectedCount: (count) => `已选 ${count} 行`,
  clearSelection: '清除',
  empty: '暂无数据',
  pagination: '分页',
  previous: '上一页',
  next: '下一页',
  page: (page) => `第 ${page} 页`,
  pageSize: '每页',
  pageSizeOption: (pageSize) => `${pageSize} 条`,
};

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'title'> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** 行唯一键，默认取 row.id，缺失时回退到原始下标 */
  getRowId?: (row: T, index: number) => string;

  /** 工具栏左侧标题 */
  title?: ReactNode;
  /** 表格标题（caption） */
  caption?: ReactNode;

  /** 受控排序状态，null 表示未排序 */
  sort?: DataTableSortState | null;
  /** 非受控初始排序状态 */
  defaultSort?: DataTableSortState | null;
  onSortChange?: (sort: DataTableSortState | null) => void;

  /** 显示行选择列 */
  selectable?: boolean;
  /** 受控选中行 key */
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;

  /** 工具栏显示全局搜索框 */
  searchable?: boolean;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  /** 自定义全局搜索匹配，默认对所有可搜索列做包含匹配 */
  globalFilterFn?: (row: T, query: string) => boolean;

  /** 是否启用分页，默认 true */
  pagination?: boolean;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;

  /** 加载态，渲染骨架行 */
  loading?: boolean;
  /** 骨架行数，默认取当前每页条数 */
  loadingRows?: number;
  /** 自定义空状态内容 */
  empty?: ReactNode;

  /** 外观：outline 描边卡片 / plain 无边框 */
  variant?: DataTableVariant;
  /** 行内边距与字号，默认 md */
  size?: DataTableSize;
  /** 斑马纹 */
  striped?: boolean;
  /** 悬停高亮，默认 true */
  hoverable?: boolean;
  /** 表头吸顶（需给容器设置高度或 maxHeight） */
  stickyHeader?: boolean;
  /** 工具栏右侧自定义内容 */
  toolbar?: ReactNode;

  /** 覆盖内置文案 */
  labels?: Partial<DataTableLabels>;
}

type DataTableValue = string | number | boolean | bigint | Date | null | undefined;

function defaultGetRowId(row: unknown, index: number): string {
  if (row !== null && typeof row === 'object') {
    const id = (row as { id?: unknown }).id;
    if (typeof id === 'string' || typeof id === 'number') return String(id);
  }
  return `row-${index}`;
}

function getCellValue<T>(row: T, column: DataTableColumn<T>): unknown {
  const accessor = column.accessor;
  if (accessor === undefined) return undefined;
  if (typeof accessor === 'function') return accessor(row);
  return (row as Record<string, unknown>)[accessor as string];
}

/** 通用比较：数字、布尔、日期按值比较，其余转字符串做自然序比较，空值排最后 */
function compareValues(a: DataTableValue, b: DataTableValue): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function defaultSortFn<T>(a: T, b: T, column: DataTableColumn<T>): number {
  return compareValues(getCellValue(a, column) as DataTableValue, getCellValue(b, column) as DataTableValue);
}

function matchesSearch<T>(row: T, columns: DataTableColumn<T>[], query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return columns.some((column) => {
    const cell = getCellValue(row, column);
    if (cell === null || cell === undefined) return false;
    return String(cell).toLowerCase().includes(needle);
  });
}

/** 默认单元格：日期本地化，其余转字符串，空值不渲染 */
function renderDefaultCell<T>(row: T, column: DataTableColumn<T>): ReactNode {
  const value = getCellValue(row, column);
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

function SortIcon({ direction }: { direction?: DataTableSortDirection }) {
  return (
    <svg className="elyri-ui-data-table__sort-icon" {...iconProps} strokeWidth={2.2}>
      {direction === 'asc' ? (
        <path d="m6 14 6-6 6 6" />
      ) : direction === 'desc' ? (
        <path d="m6 10 6 6 6-6" />
      ) : (
        <>
          <path d="m8 9 4-4 4 4" />
          <path d="m8 15 4 4 4-4" />
        </>
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="elyri-ui-data-table__search-icon" {...iconProps} strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** 骨架占位：文本条与方块两种形态 */
function DataTableSkeleton({ shape = 'text' }: { shape?: 'text' | 'box' }) {
  return <span className={cn('elyri-ui-data-table__skeleton', `is-${shape}`)} aria-hidden="true" />;
}

/** 内置空状态：随主题变色的插画 + 文案 */
function DataTableEmpty({ label }: { label: string }) {
  return (
    <div className="elyri-ui-data-table__empty-state">
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <rect className="elyri-ui-data-table__empty-paper" x="9" y="7" width="30" height="34" rx="5" />
        <rect className="elyri-ui-data-table__empty-line" x="15" y="15" width="18" height="3" rx="1.5" />
        <rect className="elyri-ui-data-table__empty-line" x="15" y="22" width="14" height="3" rx="1.5" />
        <rect className="elyri-ui-data-table__empty-line" x="15" y="29" width="16" height="3" rx="1.5" />
      </svg>
      <span className="elyri-ui-data-table__empty-label">{label}</span>
    </div>
  );
}

/**
 * 数据表格：列定义驱动，内置排序 / 全局搜索 / 分页 / 行选择，
 * 并支持加载骨架与空状态；排序、分页、选择均可受控或非受控。
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  title,
  caption,
  sort,
  defaultSort,
  onSortChange,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  searchable = false,
  search,
  defaultSearch = '',
  onSearchChange,
  globalFilterFn,
  pagination = true,
  page,
  defaultPage = 1,
  onPageChange,
  pageSize,
  defaultPageSize = 10,
  pageSizeOptions,
  onPageSizeChange,
  loading = false,
  loadingRows,
  empty,
  variant = 'outline',
  size = 'md',
  striped = false,
  hoverable = true,
  stickyHeader = false,
  toolbar,
  labels,
  className,
  ...rest
}: DataTableProps<T>) {
  const t = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);

  const [sortState, setSortState] = useControllableState<DataTableSortState | null>({
    value: sort,
    defaultValue: defaultSort ?? null,
    onChange: onSortChange,
  });
  const [selected, setSelected] = useControllableState<string[]>({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys ?? [],
    onChange: onSelectionChange,
  });
  const [searchValue, setSearchValue] = useControllableState<string>({
    value: search,
    defaultValue: defaultSearch,
    onChange: onSearchChange,
  });
  const [pageValue, setPage] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });
  const [pageSizeValue, setPageSize] = useControllableState<number>({
    value: pageSize,
    defaultValue: pageSize ?? defaultPageSize,
    onChange: onPageSizeChange,
  });

  // 记录原始下标：行 key 与单元格回调都基于原始数据，避免排序 / 筛选后错位
  const entries = useMemo(
    () => data.map((row, index) => ({ row, key: (getRowId ?? defaultGetRowId)(row, index), index })),
    [data, getRowId],
  );

  const searchableColumns = useMemo(
    () => columns.filter((column) => column.searchable !== false && column.accessor !== undefined),
    [columns],
  );

  const filteredEntries = useMemo(
    () =>
      entries.filter(({ row }) => {
        if (!searchValue) return true;
        return globalFilterFn
          ? globalFilterFn(row, searchValue)
          : matchesSearch(row, searchableColumns, searchValue);
      }),
    [entries, searchValue, globalFilterFn, searchableColumns],
  );

  const sortedEntries = useMemo(() => {
    if (!sortState) return filteredEntries;
    const column = columns.find((item) => item.id === sortState.columnId);
    if (!column) return filteredEntries;
    const factor = sortState.direction === 'desc' ? -1 : 1;
    const compare = column.sortFn ?? ((a: T, b: T) => defaultSortFn(a, b, column));
    return [...filteredEntries].sort((a, b) => compare(a.row, b.row) * factor);
  }, [filteredEntries, sortState, columns]);

  const pageCount = Math.max(1, Math.ceil(sortedEntries.length / pageSizeValue));
  const currentPage = Math.min(Math.max(pageValue, 1), pageCount);
  const pagedEntries = useMemo(() => {
    if (!pagination) return sortedEntries;
    const start = (currentPage - 1) * pageSizeValue;
    return sortedEntries.slice(start, start + pageSizeValue);
  }, [sortedEntries, pagination, currentPage, pageSizeValue]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const pageKeys = pagedEntries.map((entry) => entry.key);
  const allPageSelected = pageKeys.length > 0 && pageKeys.every((key) => selectedSet.has(key));
  const somePageSelected = pageKeys.some((key) => selectedSet.has(key));

  const resetToFirstPage = () => {
    if (pageValue !== 1) setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    resetToFirstPage();
  };

  const handleSort = (column: DataTableColumn<T>) => {
    if (sortState?.columnId !== column.id) {
      setSortState({ columnId: column.id, direction: 'asc' });
    } else if (sortState.direction === 'asc') {
      setSortState({ columnId: column.id, direction: 'desc' });
    } else {
      setSortState(null);
    }
  };

  const toggleRow = (key: string, checked: boolean) => {
    if (checked) {
      if (!selectedSet.has(key)) setSelected([...selected, key]);
    } else {
      setSelected(selected.filter((item) => item !== key));
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const additions = pageKeys.filter((key) => !selectedSet.has(key));
      if (additions.length > 0) setSelected([...selected, ...additions]);
    } else {
      setSelected(selected.filter((key) => !pageKeys.includes(key)));
    }
  };

  const colSpan = columns.length + (selectable ? 1 : 0);
  const showToolbar = Boolean(title) || searchable || Boolean(toolbar);
  const showPagination = pagination && !loading && (pageCount > 1 || Boolean(pageSizeOptions?.length));
  const showFooter = showPagination || (selectable && selected.length > 0);
  const skeletonRowCount = loadingRows ?? Math.min(Math.max(pageSizeValue, 1), 8);

  return (
    <div
      className={cn('elyri-ui-data-table', `elyri-ui-data-table--${variant}`, `elyri-ui-data-table--${size}`, className)}
      data-striped={striped ? 'true' : undefined}
      data-hoverable={hoverable ? 'true' : undefined}
      data-sticky={stickyHeader ? 'true' : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {showToolbar && (
        <div className="elyri-ui-data-table__toolbar">
          {title && <div className="elyri-ui-data-table__title">{title}</div>}
          <div className="elyri-ui-data-table__toolbar-spacer" />
          {searchable && (
            <div className="elyri-ui-data-table__search">
              <SearchIcon />
              <input
                type="search"
                className="elyri-ui-data-table__search-input"
                value={searchValue}
                placeholder={t.searchPlaceholder}
                aria-label={t.search}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="elyri-ui-data-table__viewport">
        <table className="elyri-ui-data-table__table">
          {caption && <caption className="elyri-ui-data-table__caption">{caption}</caption>}
          <thead>
            <tr className="elyri-ui-data-table__head-row">
              {selectable && (
                <th scope="col" className="elyri-ui-data-table__th is-select">
                  <span className="elyri-ui-data-table__sr-only">{t.selectAll}</span>
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={!allPageSelected && somePageSelected}
                    disabled={loading || pageKeys.length === 0}
                    aria-label={t.selectAll}
                    onCheckedChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const direction = sortState?.columnId === column.id ? sortState.direction : undefined;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn('elyri-ui-data-table__th', `is-${column.align ?? 'left'}`)}
                    style={{ width: column.width }}
                    aria-sort={
                      column.sortable
                        ? direction === 'asc'
                          ? 'ascending'
                          : direction === 'desc'
                            ? 'descending'
                            : 'none'
                        : undefined
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="elyri-ui-data-table__sort"
                        data-active={direction ? 'true' : undefined}
                        onClick={() => handleSort(column)}
                      >
                        <span>{column.header}</span>
                        <SortIcon direction={direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className="elyri-ui-data-table__row">
                    {selectable && (
                      <td className="elyri-ui-data-table__td is-select">
                        <DataTableSkeleton shape="box" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.id} className={cn('elyri-ui-data-table__td', `is-${column.align ?? 'left'}`)}>
                        <DataTableSkeleton />
                      </td>
                    ))}
                  </tr>
                ))
              : pagedEntries.length === 0
                ? (
                    <tr className="elyri-ui-data-table__empty-row">
                      <td className="elyri-ui-data-table__td elyri-ui-data-table__empty-cell" colSpan={colSpan}>
                        <div className="elyri-ui-data-table__empty">
                          {empty !== undefined ? empty : <DataTableEmpty label={t.empty} />}
                        </div>
                      </td>
                    </tr>
                  )
                : pagedEntries.map((entry, rowIndex) => {
                    const isSelected = selectedSet.has(entry.key);
                    return (
                      <tr
                        key={entry.key}
                        className="elyri-ui-data-table__row"
                        data-selected={isSelected ? 'true' : undefined}
                      >
                        {selectable && (
                          <td className="elyri-ui-data-table__td is-select">
                            <Checkbox
                              checked={isSelected}
                              aria-label={t.selectRow((currentPage - 1) * pageSizeValue + rowIndex + 1)}
                              onCheckedChange={(checked) => toggleRow(entry.key, checked)}
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td key={column.id} className={cn('elyri-ui-data-table__td', `is-${column.align ?? 'left'}`)}>
                            {column.cell ? column.cell(entry.row, entry.index) : renderDefaultCell(entry.row, column)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="elyri-ui-data-table__footer">
          <div className="elyri-ui-data-table__selection">
            {selectable && selected.length > 0 && (
              <>
                <span>{t.selectedCount(selected.length)}</span>
                <button type="button" className="elyri-ui-data-table__button" onClick={() => setSelected([])}>
                  {t.clearSelection}
                </button>
              </>
            )}
          </div>
          {showPagination && (
            <Pagination
              size="sm"
              total={pageCount}
              page={currentPage}
              onPageChange={setPage}
              pageSize={pageSizeValue}
              onPageSizeChange={setPageSize}
              pageSizeOptions={pageSizeOptions}
              labels={{
                root: t.pagination,
                previous: t.previous,
                next: t.next,
                page: t.page,
                pageSize: t.pageSize,
                pageSizeOption: t.pageSizeOption,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
