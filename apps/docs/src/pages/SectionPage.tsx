import { ShowcaseCard } from '../components/ShowcaseCard';
import { getCategories } from '../content/registry';
import { useI18n } from '../lib/i18n';
import { categoryLabel } from '../lib/messages';
import type { ComponentDoc } from '../lib/types';

interface SectionPageProps {
  label: string;
  description: string;
  /** 分区内还没有组件时展示的说明 */
  emptyLabel: string;
  docs: ComponentDoc[];
}

/** 分区落地页：按分类列出该分区的组件；分区尚未动工时说明情况，而不是给一个死链。 */
export function SectionPage({ label, description, emptyLabel, docs }: SectionPageProps) {
  const { t } = useI18n();
  const categories = getCategories(docs);

  return (
    <article className="doc-page">
      <h1 className="page-title">{label}</h1>
      <p className="page-description">{description}</p>

      {docs.length === 0 ? (
        <p className="page-description">{emptyLabel}</p>
      ) : (
        categories.map((category) => {
          const items = docs.filter((doc) => doc.category === category);
          return (
            <section key={category} className="showcase-group">
              <h2 className="section-title">
                {categoryLabel(category, t)}
                <span className="showcase-count">
                  {items.length} {t('category.count')}
                </span>
              </h2>
              <div className="showcase-grid">
                {items.map((doc) => (
                  <ShowcaseCard key={doc.slug} doc={doc} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </article>
  );
}
