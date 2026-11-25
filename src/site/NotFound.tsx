import { useEffect } from 'react';
import { Link } from '../lib/SiteLink';
import SiteLayout from './SiteLayout';
import { services } from './seo';

/**
 * A real "page not found" page. Unknown URLs used to redirect to the homepage, which Google
 * reports as "soft 404" and which hides broken links. This page is marked noindex.
 */
export default function NotFound() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, follow';
    meta.id = 'robots-notfound';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <SiteLayout seo={{ title: 'Page not found | Abdul Rahman', description: 'This page does not exist.', path: '/404' }}>
      <section className="ar-wrap ar-notfound">
        <h1 className="ar-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>Page not found</h1>
        <p className="ar-lead" style={{ marginTop: '1rem' }}>
          The page you're looking for has moved or never existed. These pages might help:
        </p>
        <ul>
          <li><Link to="/" className="ar-textlink">Home</Link></li>
          <li><Link to="/services" className="ar-textlink">Consulting services</Link></li>
          {services.slice(0, 3).map((s) => (
            <li key={s.slug}><Link to={`/services/${s.slug}`} className="ar-textlink">{s.title}</Link></li>
          ))}
          <li><Link to="/blog" className="ar-textlink">Blog</Link></li>
          <li><Link to="/tools" className="ar-textlink">Free engineering tools</Link></li>
          <li><Link to="/contact" className="ar-textlink">Book a consultation</Link></li>
        </ul>
      </section>
    </SiteLayout>
  );
}
