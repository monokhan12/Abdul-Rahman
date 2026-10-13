import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Tag, 
  Loader2, 
  AlertCircle, 
  Plus, 
  X, 
  ArrowLeft, 
  CheckCircle,
  FileText,
  Calendar,
  Lock,
  User,
  Shield,
  Eye,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getBlogPosts, 
  createBlogPost, 
  BlogPost, 
  auth,
  seedDefaultPostsIfEmpty
} from '../lib/firebase';
import BlogCard from './BlogCard';
import ThemeToggle from './ThemeToggle';
import { toast } from 'sonner';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';

export default function AllPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Admin Mode states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);

  // Form states for new post
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [category, setCategory] = useState<string>('Computational Materials Science');
  const [content, setContent] = useState<string>('');

  const categories = [
    'All',
    'Computational Materials Science',
    'Sustainable Materials',
    'Agentic AI',
    'Physical Metallurgy'
  ];

  const adminEmails = ['quanticschool@gmail.com', 'abdulrahmana18@pm.me'];

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Track login state to verify if Admin
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email && adminEmails.includes(currentUser.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    loadAllPosts();

    return () => unsubscribe();
  }, []);

  const loadAllPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      seedDefaultPostsIfEmpty();
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err: any) {
      setError('Failed to download publication logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      if (result.user.email && adminEmails.includes(result.user.email)) {
        setIsAdmin(true);
        toast.success(`Welcome back, ${result.user.displayName || 'Admin'}!`);
      } else {
        toast.success(`Signed in as ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', err);
        toast.error('Google sign-in was not completed.');
      }
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Generate clean slug automatically
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-');
    setSlug(autoSlug);
  };

  const handleSubmitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !summary || !content || !category) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setSubmittingPost(true);
    try {
      const displayDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await createBlogPost({
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        date: displayDate,
        author: 'Abdul Rahman'
      });

      // Clear states
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      setShowAddModal(false);
      toast.success('Blog post published successfully!');

      // Reload posts
      await loadAllPosts();
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error('Error creating blog post. Ensure you have authorized permission.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Filter posts based on search & category select
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-white selection:text-black pb-32">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-950/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-950/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-6 md:px-16 flex justify-between items-center z-50 bg-[#050505]/75 backdrop-blur-sm text-white border-b border-white/5 shadow-lg shadow-black/10">
        <Link to="/" className="text-2xl font-bold tracking-tighter">AR.</Link>
        <div className="flex gap-4 md:gap-8 text-xs font-semibold uppercase tracking-[0.2em] items-center">
          <ThemeToggle variant="nav" />
          <Link to="/" className="hover:text-indigo-400 transition-colors">Portfolio</Link>
          <Link to="/contact" className="px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-bold tracking-widest text-[10px]">Consultancy</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-36 relative z-10">
        {/* Header Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Hero title */}
        <div className="max-w-3xl mb-16">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-6 inline-block font-medium">
            Scientific Journals & Articles
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
            Research Insights.
          </h1>
          <p className="text-xl font-light text-white/60 leading-relaxed">
            Bridging materials discovery, chemical optimization, and process engineering through machine learning.
          </p>
        </div>

        {/* Toolbar: Search & Category filter */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-stretch md:items-center mb-12 bg-white/5 border border-white/5 p-4 rounded-3xl backdrop-blur-sm">
          {/* Categories tab */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar & Admin status */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            </div>

            {/* Quick Admin sign-in / toggle */}
            {isAdmin ? (
              <div className="flex gap-2">
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                  title="WP CMS Dashboard"
                >
                  <Settings size={14} /> WP Core CMS
                </Link>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <Plus size={14} /> Quick Post
                </button>
              </div>
            ) : (
              <Link 
                to="/admin/login"
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Author Login"
              >
                <Lock size={10} /> Publisher Login
              </Link>
            )}
          </div>
        </div>

        {/* Admin mode active notification */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-indigo-300">
              <Shield size={16} />
              <span>Logged in as Admin (<strong className="text-white">{user?.email}</strong>). You can now publish and manage articles.</span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/dashboard"
                className="text-xs font-bold uppercase text-indigo-300 hover:text-indigo-200 border-b border-indigo-300 pb-0.5 tracking-wider cursor-pointer"
              >
                WordPress Dashboard
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold uppercase text-indigo-300 hover:text-indigo-200 border-b border-indigo-300 pb-0.5 tracking-wider cursor-pointer"
              >
                Quick Writer
              </button>
            </div>
          </div>
        )}

        {/* Display Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/40 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <span className="text-xs uppercase tracking-widest font-mono font-semibold">Retrieving journal entries...</span>
          </div>
        ) : error ? (
          <div className="py-24 text-center max-w-sm mx-auto">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
            <p className="text-white/80 font-semibold mb-2">{error}</p>
            <button 
              onClick={loadAllPosts}
              className="mt-4 px-4 py-2 border border-white/10 text-xs rounded-xl hover:bg-white/5 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-32 text-center max-w-sm mx-auto border-2 border-dashed border-white/5 rounded-3xl bg-white/5 p-8">
            <Search className="text-white/20 mx-auto mb-4" size={32} />
            <h5 className="font-bold text-white/70 mb-1">No articles found</h5>
            <p className="text-xs text-white/40 leading-relaxed">
              No results matches your search "{searchQuery}" or selected category filter. Try clearing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <BlogCard key={post.id || post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal for Administrator */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 text-left shadow-2xl shadow-black/80 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black flex items-center gap-2">
                  <FileText className="text-indigo-400" size={20} /> Write Technical Publication
                </h4>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Article Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="E.g., Predictive Machine Learning on Austenitic Stainless Steels"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">URL Slug (Generated)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. predictive-ml-steels"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Short Summary</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief 2-3 sentence teaser summarizing the research scope or methodology..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                    maxLength={1000}
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Scientific Article Content (Markdown format supported)</label>
                    <span className="text-[10px] text-white/30 font-mono">### For H3, *italic*, **bold**</span>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="### Phase Transformations in Nanotribology&#10;&#10;Our research analyzes microstructural changes at friction layers..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 h-64 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-colors"
                  >
                    Discard Draft
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {submittingPost ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        Publish Article
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
