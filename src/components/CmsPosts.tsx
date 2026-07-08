import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  RefreshCw, 
  Filter, 
  FolderTree, 
  Calendar, 
  User, 
  MessageSquare, 
  ChevronRight,
  Database,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBlogPosts, deleteBlogPost, seedDefaultPostsIfEmpty, BlogPost } from '../lib/firebase';
import { toast } from 'sonner';

export default function CmsPosts() {
  const { cmsUser } = useAuthStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadPosts = async () => {
    setLoading(true);
    try {
      await seedDefaultPostsIfEmpty();
      const fetchedPosts = await getBlogPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      toast.error('Failed to sync articles with database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (slug: string, title: string) => {
    if (cmsUser?.role !== 'admin' && cmsUser?.role !== 'editor') {
      toast.error('Permission denied: Administrator or Editor role required.');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await deleteBlogPost(slug);
        toast.success('Article deleted successfully.');
        loadPosts();
      } catch (err) {
        toast.error('Deletion failed. Check security rules permissions.');
      }
    }
  };

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white dark:text-white bright:text-slate-900">
            Publishing Directory
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-500 mt-0.5 font-light">
            Draft, optimize, edit, and moderate your research publications directly.
          </p>
        </div>

        <Link
          to="/blog-admin"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition-transform hover:scale-[1.02]"
        >
          <Plus size={14} /> Compose New Article
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-4 rounded-2xl shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 dark:text-white/30 bright:text-slate-400" />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-indigo-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat} className="bg-neutral-900">{cat}</option>
            ))}
          </select>

          <button
            onClick={loadPosts}
            disabled={loading}
            className="p-2 border border-white/10 dark:border-white/10 bright:border-slate-200 bg-[#050505] dark:bg-[#050505] bright:bg-white hover:bg-white/5 rounded-xl text-white/50 dark:text-white/50 bright:text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

      </div>

      {/* POSTS TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <span className="text-xs uppercase tracking-widest font-mono">Loading records...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/5 dark:border-white/5 bright:border-slate-200 rounded-2xl bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white">
          <FileText size={36} className="mx-auto text-white/20 dark:text-white/20 bright:text-slate-300 mb-3" />
          <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-400">No published articles found matching the filters.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80 dark:text-white/80 bright:text-slate-600">
              <thead className="bg-[#050505] dark:bg-[#050505] bright:bg-slate-50 text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 border-b border-white/5 dark:border-white/5 bright:border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Title / Slug</th>
                  <th className="py-3.5 px-4 font-semibold">Classification</th>
                  <th className="py-3.5 px-4 font-semibold">Author</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 dark:divide-white/5 bright:divide-slate-100">
                {filteredPosts.map((post) => (
                  <tr key={post.slug} className="hover:bg-white/[0.01] dark:hover:bg-white/[0.01] bright:hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-white dark:text-white bright:text-slate-800 max-w-xs truncate">
                      <span className="block font-bold truncate text-white dark:text-white bright:text-slate-800">{post.title}</span>
                      <span className="block text-[10px] text-indigo-400 dark:text-indigo-400 bright:text-indigo-600 font-mono mt-0.5 truncate">/{post.slug}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 dark:text-indigo-300 bright:text-indigo-600 text-[10px] uppercase tracking-wide">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{post.author}</td>
                    <td className="py-4 px-4 text-white/50 dark:text-white/50 bright:text-slate-400 font-medium">{post.date}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="p-2 hover:bg-indigo-600/10 hover:text-indigo-400 rounded-xl transition-colors text-white/40 dark:text-white/40 bright:text-slate-400"
                          title="View live page"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to="/blog-admin"
                          className="p-2 hover:bg-emerald-600/10 hover:text-emerald-400 rounded-xl transition-colors text-white/40 dark:text-white/40 bright:text-slate-400"
                          title="Edit draft content"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug, post.title)}
                          className="p-2 hover:bg-rose-600/10 hover:text-rose-400 rounded-xl transition-colors text-white/40 dark:text-white/40 bright:text-slate-400 cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
