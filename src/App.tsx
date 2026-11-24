import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

import Home from './site/Home';
import { VenturePage, VenturesIndex } from './site/VenturePages';
import { ServicePage, ServicesIndex } from './site/ServicePages';
import { ToolPage, ToolsIndex } from './site/tools/ToolPages';
import NotFound from './site/NotFound';
import { CmsErrorBoundary } from './components/CmsErrorPage';

// Heavier pages load on demand, so the homepage and service pages stay fast.
const Contact = lazy(() => import('./Contact'));
const AllPostsPage = lazy(() => import('./components/AllPostsPage'));
const BlogPostPage = lazy(() => import('./components/BlogPostPage'));
const BlogAdminPage = lazy(() => import('./components/BlogAdminPage'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));

/** Keep admin and CMS screens out of search results (they are also disallowed in robots.txt). */
function NoIndexPrivateRoutes() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!/^\/(admin|blog-admin)(\/|$)/.test(pathname)) return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.id = 'robots-private';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [pathname]);
  return null;
}

/** Start each new page at the top; in-page anchors (/#research) are handled by the page itself. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageLoading() {
  return <div className="ar-page" style={{ minHeight: '100vh' }} aria-busy="true" />;
}

export default function App() {
  return (
    <CmsErrorBoundary>
      <ScrollToTop />
      <NoIndexPrivateRoutes />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolsIndex />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/services" element={<ServicesIndex />} />
          <Route path="/services/:slug" element={<ServicePage />} />
          <Route path="/ventures" element={<VenturesIndex />} />
          <Route path="/ventures/:slug" element={<VenturePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<AllPostsPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/blog-admin" element={<BlogAdminPage />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" richColors theme="dark" />
    </CmsErrorBoundary>
  );
}
