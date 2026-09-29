import { Link } from '../lib/router';
import { docPath } from '../lib/sections';
import type { ComponentDoc } from '../lib/types';

interface SectionPageProps {
  label: string;
  description: string;
  /** 分区内还没有组件时展示的说明 */
  emptyLabel: string;
  docs: ComponentDoc[];
}

/** 分区落地页：列出该分区的组件；分区尚未动工时说明情况，而不是给一个死链。 */
export function SectionPage({ label, description, emptyLabel, docs }: SectionPageProps) {
  return (
    <article className="doc-page">
      <h1 className="page-title">{label}</h1>
      <p className="page-description">{description}</p>

      {docs.length === 0 ? (
        <p className="page-description">{emptyLabel}</p>
      ) : (
        <div className="showcase-group">
          <div className="showcase-grid">
            {docs.map((doc) => (
              <div key={doc.slug} className="showcase-card">
                <div className="showcase-card-body">
                  <div className="showcase-card-head">
                    <span className="showcase-card-title">{doc.title}</span>
                    {doc.isNew && <span className="new-tag">New</span>}
                  </div>
                  <p className="showcase-card-desc">{doc.description}</p>
                </div>
                <Link className="showcase-card-link" to={docPath(doc)} aria-label={doc.title} />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
