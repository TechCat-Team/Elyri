import { useI18n } from '../lib/i18n';
import { Link } from '../lib/router';

export interface PagerTarget {
  path: string;
  title: string;
}

/** 上一页 / 下一页 */
export function Pager({ prev, next }: { prev?: PagerTarget; next?: PagerTarget }) {
  const { t } = useI18n();

  return (
    <nav className="pager">
      {prev ? (
        <Link to={prev.path} className="pager-link">
          <span>{t('page.prev')}</span>
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={next.path} className="pager-link is-next">
          <span>{t('page.next')}</span>
          {next.title}
        </Link>
      )}
    </nav>
  );
}
