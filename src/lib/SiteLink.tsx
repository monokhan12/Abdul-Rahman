import { forwardRef } from 'react';
import { Link as RouterLink, type LinkProps } from 'react-router-dom';

/**
 * GitHub Pages serves every page as a folder (/blog/post/), and answers /blog/post with a
 * 301 redirect. Links without the trailing slash make Google crawl a redirect first and
 * report those URLs as "Page with redirect" instead of indexing them, so every internal
 * link points straight at the canonical, slash-terminated URL.
 */
export const canonicalPath = (to: string): string => {
  if (!to.startsWith('/') || to.startsWith('//')) return to;
  const [rest, hash = ''] = to.split('#');
  const [path, query = ''] = rest.split('?');
  const slashed = path === '' || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path || '/' : `${path}/`;
  return `${slashed}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function SiteLink({ to, ...rest }, ref) {
  return <RouterLink ref={ref} to={typeof to === 'string' ? canonicalPath(to) : to} {...rest} />;
});

export default Link;
