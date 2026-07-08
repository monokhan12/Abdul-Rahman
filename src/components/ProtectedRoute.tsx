import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { CmsFullPageLoader } from './CmsLoading';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'editor' | 'author' | 'subscriber')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, cmsUser, loading, initialized, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Run initialization if not yet completed
    if (!initialized) {
      const unsubscribe = initialize();
      return () => unsubscribe();
    }
  }, [initialized, initialize]);

  if (!initialized || (loading && !user)) {
    return <CmsFullPageLoader message="Verifying security credentials..." />;
  }

  // If no user is authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user's role is permitted
  if (allowedRoles && cmsUser && !allowedRoles.includes(cmsUser.role)) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Administrative Guard Block</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Your current profile credentials (<strong className="text-white font-mono">{cmsUser.role}</strong>) do not carry permission clearings to access this administrative scope.
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 flex gap-4">
            <Navigate to="/blog" replace />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
