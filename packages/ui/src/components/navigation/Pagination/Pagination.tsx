import { forwardRef, useMemo, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn, useControllableState } from '../../../core';

import './Pagination.css';

export type PaginationVariant = 'outline' | 'filled';
export type PaginationSize = 'sm' | 'md';

/** 折叠区间用省略号占位，其余为真实页码 */
type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

export interface PaginationLabels {
  /** 整组导航的无障碍名称 */
  root: string;
  first: string;
  previous: string;
  next: string;
  last: string;
  /** 页码按钮的 aria-label */
  page: (page: number) => string;
  /** 每页条数选择器前置文案 */
  pageSize: string;
  /** 每页条数选项文案 */
  pageSizeOption: (pageSize: number) => string;
  /** 跳转输入框前置文案 */
  jump: string;
  /** 跳转输入框后置单位 */
  jumpUnit: string;
  jumpPlaceholder: string;
}

const DEFAULT_LABELS: PaginationLabels = {
  root: '分页',
  first: '第一页',
  previous: '上一页',
  next: '下一页',
  last: '最后一页',
  page: (page) => `第 ${page} 页`,
  pageSize: '每页',
  pageSizeOption: (pageSize) => `${pageSize} 条`,
  jump: '跳至',
  jumpUnit: '页',
  jumpPlaceholder: '',
};

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index);

/**
 * 经典区间折叠算法：始终保留首尾 boundaryCount 个页码，
 * 当前页两侧展开 siblingCount 个，中间被略过的部分用省略号占位。
 */
function buildItems(total: number, page: number, siblingCount: number, boundaryCount: number): PaginationItem[] {
  const startPages = range(1, Math.min(boundaryCount, total));
  const endPages = range(Math.max(total - boundaryCount + 1, boundaryCount + 1), total);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : total - 1,
  );

  const items: PaginationItem[] = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    items.push('start-ellipsis');
  } else if (boundaryCount + 1 < total - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < total - boundaryCount - 1) {
    items.push('end-ellipsis');
  } else if (total - boundaryCount > boundaryCount) {
    items.push(total - boundaryCount);
  }

  items.push(...endPages);

  return items;
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  focusable: false,
} as const;

/** 方向图标：单 / 双 chevron，随按钮字号缩放 */
function Chevron({ direction }: { direction: 'left' | 'right' | 'down' | 'first' | 'last' }) {
  const paths =
    direction === 'left'
      ? ['m15 18-6-6 6-6']
      : direction === 'right'
        ? ['m9 18 6-6-6-6']
        : direction === 'down'
          ? ['m6 9 6 6 6-6']
          : direction === 'first'
            ? ['m11 17-5-5 5-5', 'm18 17-5-5 5-5']
            : ['m13 17 5-5-5-5', 'm6 17 5-5-5-5'];

  return (
    <svg {...iconProps} aria-hidden="true">
      {paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

interface PaginationButtonProps {
  disabled?: boolean;
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function PaginationButton({ disabled, active, label, onClick, children }: PaginationButtonProps) {
  return (
    <li className="elyri-ui-pagination__cell">
      <button
        type="button"
        className="elyri-ui-pagination__item"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}

interface PaginationJumpProps {
  page: number;
  total: number;
  disabled: boolean;
  labels: PaginationLabels;
  onJump: (page: number) => void;
}

/** 跳转输入框：回车或失焦时提交，数字外的字符直接过滤 */
function PaginationJump({ page, total, disabled, labels, onJump }: PaginationJumpProps) {
  const [draft, setDraft] = useState(String(page));
  const [syncedPage, setSyncedPage] = useState(page);

  // 外部翻页后同步回显，避免输入框停留在旧值；渲染期调整，省去一轮 effect 提交
  if (syncedPage !== page) {
    setSyncedPage(page);
    setDraft(String(page));
  }

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(page));
      return;
    }
    const next = Math.min(Math.max(parsed, 1), total);
    setDraft(String(next));
    if (next !== page) onJump(next);
  };

  return (
    <label className="elyri-ui-pagination__jump">
      <span>{labels.jump}</span>
      <input
        className="elyri-ui-pagination__jump-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        disabled={disabled}
        aria-label={labels.jump}
        placeholder={labels.jumpPlaceholder}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          commit();
        }}
      />
      <span>{labels.jumpUnit}</span>
    </label>
  );
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 总页数 */
  total: number;
  /** 受控当前页（从 1 开始） */
  page?: number;
  /** 非受控初始页，默认 1 */
  defaultPage?: number;
  /** 当前页变化回调 */
  onPageChange?: (page: number) => void;
  /** 当前页两侧各展开的页码数，默认 1 */
  siblingCount?: number;
  /** 首尾各固定展示的页码数，默认 1 */
  boundaryCount?: number;
  /** 是否显示首页 / 末页按钮，默认 false */
  showEdges?: boolean;
  /** 外观，默认 outline */
  variant?: PaginationVariant;
  /** 尺寸，默认 md */
  size?: PaginationSize;
  /** 禁用整组交互 */
  disabled?: boolean;
  /** 受控每页条数（需配合 pageSizeOptions 显示选择器） */
  pageSize?: number;
  /** 非受控初始每页条数，默认取 pageSizeOptions 第一项 */
  defaultPageSize?: number;
  /** 每页条数选项；传入后显示选择器 */
  pageSizeOptions?: number[];
  /** 每页条数变化回调 */
  onPageSizeChange?: (pageSize: number) => void;
  /** 是否显示跳转到指定页的输入框，默认 false */
  showJump?: boolean;
  /** 覆盖内置文案（无障碍标签与提示） */
  labels?: Partial<PaginationLabels>;
}

/** 分页：受控 / 非受控双支持，区间折叠，可选每页条数选择器与跳转输入框 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    total,
    page,
    defaultPage = 1,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    showEdges = false,
    variant = 'outline',
    size = 'md',
    disabled = false,
    pageSize,
    defaultPageSize,
    pageSizeOptions,
    onPageSizeChange,
    showJump = false,
    labels,
    className,
    ...rest
  },
  ref,
) {
  const t = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);
  const pageCount = Math.max(1, Math.floor(total));
  const [rawPage, setPage] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });
  // 总页数变小或外部传入越界值时收敛到有效范围，避免页码落在区间外
  const current = Math.min(Math.max(rawPage, 1), pageCount);

  const [currentPageSize, setPageSize] = useControllableState<number>({
    value: pageSize,
    defaultValue: defaultPageSize ?? pageSizeOptions?.[0] ?? 10,
    onChange: onPageSizeChange,
  });

  const items = useMemo(
    () => buildItems(pageCount, current, siblingCount, boundaryCount),
    [pageCount, current, siblingCount, boundaryCount],
  );

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), pageCount);
    if (clamped !== current) setPage(clamped);
  };

  const showPageSize = Array.isArray(pageSizeOptions) && pageSizeOptions.length > 0;

  return (
    <nav
      ref={ref}
      aria-label={t.root}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(
        'elyri-ui-pagination',
        `elyri-ui-pagination--${variant}`,
        `elyri-ui-pagination--${size}`,
        className,
      )}
      {...rest}
    >
      {showPageSize && (
        <span className="elyri-ui-pagination__size">
          <span>{t.pageSize}</span>
          <span className="elyri-ui-pagination__select-wrap">
            <select
              className="elyri-ui-pagination__select"
              value={currentPageSize}
              disabled={disabled}
              aria-label={t.pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {t.pageSizeOption(option)}
                </option>
              ))}
            </select>
            <span className="elyri-ui-pagination__caret" aria-hidden="true">
              <Chevron direction="down" />
            </span>
          </span>
        </span>
      )}

      <ul className="elyri-ui-pagination__list">
        {showEdges && (
          <PaginationButton disabled={disabled || current <= 1} label={t.first} onClick={() => goTo(1)}>
            <Chevron direction="first" />
          </PaginationButton>
        )}
        <PaginationButton disabled={disabled || current <= 1} label={t.previous} onClick={() => goTo(current - 1)}>
          <Chevron direction="left" />
        </PaginationButton>

        {items.map((item) =>
          typeof item === 'number' ? (
            <PaginationButton
              key={item}
              active={item === current}
              disabled={disabled}
              label={t.page(item)}
              onClick={() => goTo(item)}
            >
              {item}
            </PaginationButton>
          ) : (
            <li key={item} className="elyri-ui-pagination__ellipsis" aria-hidden="true">
              …
            </li>
          ),
        )}

        <PaginationButton disabled={disabled || current >= pageCount} label={t.next} onClick={() => goTo(current + 1)}>
          <Chevron direction="right" />
        </PaginationButton>
        {showEdges && (
          <PaginationButton disabled={disabled || current >= pageCount} label={t.last} onClick={() => goTo(pageCount)}>
            <Chevron direction="last" />
          </PaginationButton>
        )}
      </ul>

      {showJump && <PaginationJump page={current} total={pageCount} disabled={disabled} labels={t} onJump={goTo} />}
    </nav>
  );
});
