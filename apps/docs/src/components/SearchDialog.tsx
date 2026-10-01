import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { useI18n } from '../lib/i18n';
import { useRoute } from '../lib/router';

export interface SearchItem {
  path: string;
  title: string;
  /** 右侧的归属说明，例如「文档」「动效 · 背景」 */
  meta: string;
  /** 额外参与匹配的文本（描述、分类原名等） */
  keywords: string;
}

interface SearchDialogProps {
  items: SearchItem[];
  onClose: () => void;
}

export function SearchDialog({ items, onClose }: SearchDialogProps) {
  const { t } = useI18n();
  const { push } = useRoute();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    // 标题命中排在描述命中之前
    const byTitle = items.filter((item) => item.title.toLowerCase().includes(q));
    const byOther = items.filter(
      (item) => !byTitle.includes(item) && `${item.meta} ${item.keywords}`.toLowerCase().includes(q),
    );
    return [...byTitle, ...byOther];
  }, [items, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 键盘移动光标时，让选中项保持在可视范围内
  useEffect(() => {
    listRef.current?.querySelector('.search-item.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const select = (item: SearchItem) => {
    push(item.path);
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (event.key === 'Enter' && results[cursor]) {
      select(results[cursor]);
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div className="search-dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <ul className="search-results" ref={listRef}>
          {results.length === 0 && <li className="search-empty">{t('search.empty')}</li>}
          {results.map((item, index) => (
            <li key={item.path}>
              <button
                type="button"
                className={index === cursor ? 'search-item is-active' : 'search-item'}
                onMouseEnter={() => setCursor(index)}
                onClick={() => select(item)}
              >
                <span>{item.title}</span>
                <span className="search-item-category">{item.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
