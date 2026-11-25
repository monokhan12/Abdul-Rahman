import { Link } from '../lib/SiteLink';
import posts from '../content/posts.json';
import { services } from './seo';

type Props = { slug: string; category?: string };

/** Services that cite this article, else the closest match by topic. */
export function servicesForPost(slug: string) {
  const direct = services.filter((s) => (s.related as string[]).includes(slug));
  return direct.length ? direct : services.slice(0, 2);
}

/** Other articles: same category first, then the newest ones. */
export function morePosts(slug: string, category?: string, n = 3) {
  const others = [...posts].filter((p) => p.slug !== slug).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return [...others.filter((p) => p.category === category), ...others.filter((p) => p.category !== category)].slice(0, n);
}

/**
 * Internal links at the end of every article, so each blog post links to the consulting
 * service it supports and to related reading. This gives search engines a clear path
 * between pages instead of leaving posts as dead ends.
 */
export default function RelatedLinks({ slug, category }: Props) {
  const svc = servicesForPost(slug);
  const more = morePosts(slug, category);
  return (
    <aside className="ar-related" aria-label="Related pages">
      <div>
        <h2 className="ar-h3">Related consulting services</h2>
        <ul>
          {svc.map((s) => (
            <li key={s.slug}><Link to={`/services/${s.slug}`} className="ar-textlink">{s.title}</Link></li>
          ))}
          <li><Link to="/contact" className="ar-textlink">Book a free 30-minute consultation</Link></li>
        </ul>
      </div>
      {more.length > 0 && (
        <div>
          <h2 className="ar-h3">More articles</h2>
          <ul>
            {more.map((p) => (
              <li key={p.slug}><Link to={`/blog/${p.slug}`} className="ar-textlink">{p.title}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
