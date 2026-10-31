import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

import Contact from './Contact';
import AllPostsPage from './components/AllPostsPage';
import BlogPostPage from './components/BlogPostPage';
import BlogAdminPage from './components/BlogAdminPage';
import { useAuthStore } from './stores/authStore';

// Redesigned public site
import Home from './site/Home';
import { VenturePage, VenturesIndex } from './site/VenturePages';
import { ServicePage, ServicesIndex } from './site/ServicePages';

// Admin CMS Components
import ProtectedRoute from './components/ProtectedRoute';
import CmsLayout from './components/CmsLayout';
import CmsLogin from './components/CmsLogin';
import CmsDashboard from './components/CmsDashboard';
import CmsPosts from './components/CmsPosts';
import CmsCategories from './components/CmsCategories';
import CmsMedia from './components/CmsMedia';
import CmsSettings from './components/CmsSettings';
import UserProfile from './components/UserProfile';
import { CmsErrorBoundary } from './components/CmsErrorPage';

/** Start each new page at the top; in-page anchors (/#research) are handled by the page itself. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  useEffect(() => {
    return useAuthStore.getState().initialize();
  }, []);

  return (
    <CmsErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Public Portfolio Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesIndex />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/ventures" element={<VenturesIndex />} />
        <Route path="/ventures/:slug" element={<VenturePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<AllPostsPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blog-admin" element={<BlogAdminPage />} />

        {/* CMS Administration Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<CmsLogin />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsDashboard />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/posts" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsPosts />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsCategories />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/media" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsMedia />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <CmsSettings />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute>
              <CmsLayout>
                <UserProfile />
              </CmsLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors theme="dark" />
    </CmsErrorBoundary>
  );
}
