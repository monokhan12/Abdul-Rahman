import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  PenTool, 
  Bell, 
  Globe, 
  BookOpen, 
  FolderTree, 
  Tag, 
  MessagesSquare, 
  Users 
} from 'lucide-react';
import { toast } from 'sonner';

interface CmsLayoutProps {
  children: ReactNode;
}

export default function CmsLayout({ children }: CmsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cmsUser, signOut } = useAuthStore();
  const { theme, sidebarOpen, toggleTheme, toggleSidebar, activeNav, setActiveNav } = useUiStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Sync active navigation link with location path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) setActiveNav('dashboard');
    else if (path.includes('/admin/posts')) setActiveNav('posts');
    else if (path.includes('/admin/media')) setActiveNav('media');
    else if (path.includes('/admin/categories')) setActiveNav('categories');
    else if (path.includes('/admin/settings')) setActiveNav('settings');
    else if (path.includes('/admin/profile')) setActiveNav('profile');
  }, [location.pathname, setActiveNav]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out securely.');
      navigate('/admin/login');
    } catch (err) {
      toast.error('Failed to sign out securely.');
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'posts', name: 'Blog Posts', path: '/admin/posts', icon: FileText },
    { id: 'media', name: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { id: 'categories', name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { id: 'settings', name: 'Settings', path: '/admin/settings', icon: Settings },
    { id: 'profile', name: 'Publisher Profile', path: '/admin/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] dark:bg-[#050505] dark:text-[#FAFAFA] bright:bg-slate-50 bright:text-slate-900 font-sans flex overflow-hidden relative">
      
      {/* Background radial gradients for Dark Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-950/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-950/5 blur-[150px]" />
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border-r border-white/5 dark:border-white/5 bright:border-slate-200/80 transition-all duration-300 flex flex-col shadow-2xl h-full ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 dark:border-white/5 bright:border-slate-100">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
              W
            </div>
            {sidebarOpen && (
              <span className="text-base font-black tracking-tight text-white dark:text-white bright:text-slate-900">
                WP Core CMS
              </span>
            )}
          </Link>
          
          {sidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-50 rounded-lg text-white/40 dark:text-white/40 bright:text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeNav === item.id;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white dark:text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-white/50 dark:text-white/50 bright:text-slate-500 hover:text-white dark:hover:text-white bright:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-100'
                }`}
              >
                <IconComponent size={18} className={isSelected ? 'text-white' : 'text-indigo-400/80 bright:text-indigo-500/80'} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 dark:border-white/5 bright:border-slate-100 flex flex-col gap-2">
          {!sidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="w-12 h-12 rounded-xl border border-white/10 dark:border-white/10 bright:border-slate-200 flex items-center justify-center text-white/50 dark:text-white/50 bright:text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer mx-auto"
            >
              <ChevronRight size={16} />
            </button>
          )}
          
          {sidebarOpen && (
            <div className="bg-white/[0.01] dark:bg-white/[0.01] bright:bg-slate-50/50 p-3 rounded-xl border border-white/5 dark:border-white/5 bright:border-slate-100/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">
                {cmsUser?.displayName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-bold text-white dark:text-white bright:text-slate-900 truncate uppercase tracking-wide">
                  {cmsUser?.displayName || 'Publisher'}
                </span>
                <span className="block text-[8px] font-bold text-indigo-400 dark:text-indigo-400 bright:text-indigo-600 font-mono uppercase tracking-widest mt-0.5">
                  {cmsUser?.role || 'Author'}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE WRAPPER */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        
        {/* TOP NAVBAR HEADERS */}
        <header className="h-16 fixed top-0 right-0 z-30 bg-[#0d0d0d]/80 dark:bg-[#0d0d0d]/80 bright:bg-white/80 backdrop-blur-md border-b border-white/5 dark:border-white/5 bright:border-slate-200/80 flex items-center justify-between px-8 transition-all duration-300" style={{ left: sidebarOpen ? '256px' : '80px' }}>
          
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-50 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <Menu size={18} />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 dark:text-white/40 bright:text-slate-400 font-mono">
              <Link to="/blog" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                <Globe size={13} /> View Live Journal
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle icon button */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-white/10 dark:border-white/10 bright:border-slate-200 bg-white/[0.01] hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-50 rounded-xl text-white/50 dark:text-white/50 bright:text-slate-400 hover:text-white dark:hover:text-white bright:hover:text-indigo-600 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'bright' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Quick Draft Actions */}
            <Link
              to="/admin/posts"
              className="hidden md:flex px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10 transition-transform hover:scale-[1.02]"
            >
              <PenTool size={13} /> Create Draft
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-xl border border-white/10 dark:border-white/10 bright:border-slate-200 bg-white/[0.01] hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-50 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <User size={15} />
              </button>

              {profileDropdownOpen && (
                <>
                  {/* Backdrop closer */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-2.5 w-56 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 p-2.5 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-white/5 dark:border-b-white/5 bright:border-b-slate-100">
                      <span className="block text-xs font-bold text-white dark:text-white bright:text-slate-900 truncate uppercase">
                        {cmsUser?.displayName || 'Publisher'}
                      </span>
                      <span className="block text-[9px] text-white/40 dark:text-white/40 bright:text-slate-400 truncate mt-0.5">
                        {user?.email}
                      </span>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-white/60 dark:text-white/60 bright:text-slate-600 hover:text-white dark:hover:text-white bright:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <User size={14} className="text-indigo-400" />
                        My Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-white/5 dark:border-white/5 bright:border-slate-100 pt-1.5">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors text-left"
                      >
                        <LogOut size={14} />
                        Sign Out Securely
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* CONTENT FIELD INJECTION FRAME */}
        <main className="flex-1 pt-24 pb-16 px-6 md:px-12 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
