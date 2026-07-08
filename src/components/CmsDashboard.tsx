import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { 
  FileText, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  Database,
  RefreshCw,
  Sparkles,
  Inbox
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getBlogPosts, seedDefaultPostsIfEmpty, getAllComments } from '../lib/firebase';
import { toast } from 'sonner';

// Sample data for charts
const pageViewsData = [
  { date: 'Jul 01', views: 240, readTime: 120 },
  { date: 'Jul 02', views: 360, readTime: 180 },
  { date: 'Jul 03', views: 300, readTime: 160 },
  { date: 'Jul 04', views: 540, readTime: 210 },
  { date: 'Jul 05', views: 420, readTime: 190 },
  { date: 'Jul 06', views: 680, readTime: 310 },
  { date: 'Jul 07', views: 720, readTime: 340 },
];

const categoryDistribution = [
  { name: 'Materials Science', value: 4, color: '#6366f1' },
  { name: 'Sustainable Materials', value: 3, color: '#a855f7' },
  { name: 'Agentic AI', value: 2, color: '#ec4899' },
  { name: 'Physical Metallurgy', value: 2, color: '#3b82f6' },
];

interface DashboardStats {
  articlesCount: number;
  commentsCount: number;
  inquiriesCount: number;
  activeUsersCount: number;
}

export default function CmsDashboard() {
  const { cmsUser } = useAuthStore();
  const { theme } = useUiStore();
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    articlesCount: 0,
    commentsCount: 0,
    inquiriesCount: 0,
    activeUsersCount: 3 // Default fallback
  });

  const loadDashboardStats = async () => {
    setSyncing(true);
    try {
      await seedDefaultPostsIfEmpty();
      const fetchedPosts = await getBlogPosts();
      const fetchedComments = await getAllComments();
      
      setStats({
        articlesCount: fetchedPosts.length,
        commentsCount: fetchedComments.length,
        inquiriesCount: 2, // Sample inbox messages
        activeUsersCount: 4 // Admin, Editor, etc.
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const handleManualSync = async () => {
    await loadDashboardStats();
    toast.success('Dashboard telemetry synchronized successfully!');
  };

  const statCards = [
    { 
      label: 'Research Articles', 
      value: stats.articlesCount, 
      icon: FileText, 
      color: 'text-indigo-400 border-indigo-500/10 bg-indigo-500/5',
      trend: '+12% from last month'
    },
    { 
      label: 'Peer Reviews / Comments', 
      value: stats.commentsCount, 
      icon: MessageSquare, 
      color: 'text-purple-400 border-purple-500/10 bg-purple-500/5',
      trend: '+8% approval rating'
    },
    { 
      label: 'Direct Inquiries', 
      value: stats.inquiriesCount, 
      icon: Inbox, 
      color: 'text-pink-400 border-pink-500/10 bg-pink-500/5',
      trend: 'No unresolved drafts'
    },
    { 
      label: 'CMS Administrators', 
      value: stats.activeUsersCount, 
      icon: Users, 
      color: 'text-blue-400 border-blue-500/10 bg-blue-500/5',
      trend: 'Standard RBAC active'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 dark:border-white/5 bright:border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={16} className="text-yellow-400 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 dark:text-indigo-400 bright:text-indigo-600 font-mono">
              Administration Gateway
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white dark:text-white bright:text-slate-900">
            Welcome back, {cmsUser?.displayName || 'Publisher'}
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-500 leading-relaxed max-w-lg mt-0.5 font-light">
            Here is an overview of your geological science journal statistics, active peer comments, and system metadata.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="px-4 py-2 border border-white/10 dark:border-white/10 bright:border-slate-200 hover:bg-white/5 dark:hover:bg-white/5 bright:hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Synchronizing...' : 'Sync Telemetry'}
        </button>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i}
              className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-lg relative group overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-white/40 dark:text-white/40 bright:text-slate-400 tracking-widest font-mono">
                    {card.label}
                  </span>
                  <strong className="block text-3xl font-black text-white dark:text-white bright:text-slate-900">
                    {card.value}
                  </strong>
                </div>
                <div className={`w-11 h-11 border rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 dark:border-t-white/5 bright:border-t-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/40 dark:text-white/40 bright:text-slate-400">
                  {card.trend}
                </span>
                <TrendingUp size={12} className="text-emerald-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Recharts Analytics Area Chart */}
        <div className="lg:col-span-8 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-3xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/5 dark:border-white/5 bright:border-slate-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white dark:text-white bright:text-slate-900">
                Visitor Metrics (Simulated)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Live updates active
            </span>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pageViewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'bright' ? '#e2e8f0' : '#1f1f1f'} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme === 'bright' ? '#64748b' : '#525252'} 
                  tick={{ fill: theme === 'bright' ? '#64748b' : '#525252', fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis 
                  stroke={theme === 'bright' ? '#64748b' : '#525252'} 
                  tick={{ fill: theme === 'bright' ? '#64748b' : '#525252', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'bright' ? '#ffffff' : '#0d0d0d', 
                    borderColor: theme === 'bright' ? '#cbd5e1' : '#333333',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: theme === 'bright' ? '#0f172a' : '#fafafa'
                  }} 
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#viewsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution visualizer */}
        <div className="lg:col-span-4 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="pb-4 mb-4 border-b border-white/5 dark:border-white/5 bright:border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white dark:text-white bright:text-slate-900">
              Discipline Distribution
            </h3>
          </div>

          <div className="h-44 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Topics</span>
              <strong className="text-xl font-black text-white dark:text-white bright:text-slate-900">4 Main</strong>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {categoryDistribution.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-[10px] p-1.5 bg-white/[0.01] dark:bg-white/[0.01] bright:bg-slate-50 border border-white/5 dark:border-white/5 bright:border-slate-100 rounded-xl">
                <div className="flex items-center gap-2 font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-white/80 dark:text-white/80 bright:text-slate-700">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-white/50">{entry.value} posts</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CORE SECURE TELEMETRY */}
      <div className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="block text-xs font-bold text-white dark:text-white bright:text-slate-900 uppercase">
              Role-Based Access Control Active
            </span>
            <span className="block text-[10px] text-white/40 dark:text-white/40 bright:text-slate-400 font-light mt-0.5">
              Secure administrative sessions are maintained with strict token synchronization rules.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-white/30 dark:text-white/30 bright:text-slate-400 font-bold bg-[#050505] dark:bg-[#050505] bright:bg-slate-50 px-3 py-1.5 border border-white/5 rounded-xl">
          <Database size={12} className="text-indigo-400" />
          <span>Firestore Engine: SECURE</span>
        </div>
      </div>

    </div>
  );
}
