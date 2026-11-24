import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import CmsLayout from './components/CmsLayout';
import CmsLogin from './components/CmsLogin';
import CmsDashboard from './components/CmsDashboard';
import CmsPosts from './components/CmsPosts';
import CmsCategories from './components/CmsCategories';
import CmsMedia from './components/CmsMedia';
import CmsSettings from './components/CmsSettings';
import UserProfile from './components/UserProfile';

/**
 * The CMS lives in its own lazily loaded chunk, so visitors to the public site
 * never download the admin screens, charts or the Firebase auth store.
 */
const guarded = (page: ReactNode) => (
  <ProtectedRoute>
    <CmsLayout>{page}</CmsLayout>
  </ProtectedRoute>
);

export default function AdminRoutes() {
  useEffect(() => useAuthStore.getState().initialize(), []);

  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="login" element={<CmsLogin />} />
      <Route path="dashboard" element={guarded(<CmsDashboard />)} />
      <Route path="posts" element={guarded(<CmsPosts />)} />
      <Route path="categories" element={guarded(<CmsCategories />)} />
      <Route path="media" element={guarded(<CmsMedia />)} />
      <Route path="settings" element={guarded(<CmsSettings />)} />
      <Route path="profile" element={guarded(<UserProfile />)} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
