import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { useI18n } from '../lib/i18n';
import { categoryLabel } from '../lib/messages';
import { useRoute } from '../lib/router';
import type { ComponentDoc } from '../lib/types';

interface SearchDialogProps {
  docs: ComponentDoc[];
  onClose: () => void;
}

export function SearchDialog({ docs, onClose }: SearchDialogProps) {
  const { t } = useI18n();
  const { push } = useRoute();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((doc) =>
      [doc.title, doc.category, doc.description].some((text) => text.toLowerCase().includes(q)),
    );
  }, [docs, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const select = (doc: ComponentDoc) => {
    push(`components/${doc.slug}`);
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
      <div className="search-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <ul className="search-results">
          {results.length === 0 && <li className="search-empty">{t('search.empty')}</li>}
          {results.map((doc, index) => (
            <li key={doc.slug}>
              <button
                type="button"
                className={index === cursor ? 'search-item is-active' : 'search-item'}
                onMouseEnter={() => setCursor(index)}
                onClick={() => select(doc)}
              >
                <span>{doc.title}</span>
                <span className="search-item-category">{categoryLabel(doc.category, t)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
