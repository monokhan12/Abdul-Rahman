// Prefixes a root-relative path ("/images/x.jpg") with the deploy base path,
// so public files resolve when the site is served from a sub-folder (GitHub Pages).
export const withBase = (path: string): string => {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base && !path.startsWith(base + '/') ? base + path : path;
};
