import { useState, useEffect, useRef, FormEvent } from 'react';
import { withBase } from '../lib/withBase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Check, 
  X, 
  ArrowLeft, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Settings, 
  AlertCircle, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  BookOpen, 
  Shield, 
  Search, 
  Eye, 
  Loader2, 
  RefreshCw,
  Bold,
  Italic,
  Heading2,
  List,
  Code,
  Link2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  getBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  getAllComments, 
  deleteComment, 
  BlogPost, 
  BlogComment, 
  auth,
  seedDefaultPostsIfEmpty
} from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';

type ActiveTab = 'editor' | 'manage' | 'comments';

export default function BlogAdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  
  // Auth & Admin state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  // Passcode login state as alternative/override
  const [passcode, setPasscode] = useState<string>('');
  const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Data states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  
  // Editor states
  const [editingPostSlug, setEditingPostSlug] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [category, setCategory] = useState<string>('Computational Materials Science');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [useCustomCategory, setUseCustomCategory] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [author, setAuthor] = useState<string>('Abdul Rahman');
  const [customDate, setCustomDate] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editor modes: edit vs preview
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const adminEmails = ['quanticschool@gmail.com'];
  const categoriesList = [
    'Computational Materials Science',
    'Sustainable Materials',
    'Agentic AI',
    'Physical Metallurgy'
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all posts and comments when authenticated
  useEffect(() => {
    if (isAdmin) {
      loadPosts();
      loadComments();
    }
  }, [isAdmin]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      await seedDefaultPostsIfEmpty();
      const fetchedPosts = await getBlogPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const fetchedComments = await getAllComments();
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email && adminEmails.includes(result.user.email)) {
        setIsAdmin(true);
        toast.success(`Welcome, Admin (${result.user.email})!`);
      } else {
        toast.error(`Authenticated as ${result.user.email}. Note: Only authorized administrator emails can modify records.`);
      }
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const handlePasscodeLogin = (e: FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === 'admin' || passcode.trim() === '6trillion') {
      setIsPasscodeAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('blog_admin_passcode_auth', 'true');
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid administrative access key.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('blog_admin_passcode_auth');
    setIsPasscodeAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostSlug) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-');
      setSlug(autoSlug);
    }
  };

  // Helper to insert markdown formatting in textarea
  const insertMarkdown = (syntaxType: 'bold' | 'italic' | 'heading' | 'list' | 'code' | 'link' | 'image') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;

    switch (syntaxType) {
      case 'bold':
        replacement = `**${selection || 'bold text'}**`;
        cursorOffset = selection ? 0 : -2;
        break;
      case 'italic':
        replacement = `*${selection || 'italic text'}*`;
        cursorOffset = selection ? 0 : -1;
        break;
      case 'heading':
        replacement = `\n## ${selection || 'Heading'}\n`;
        break;
      case 'list':
        replacement = `\n* ${selection || 'List item'}`;
        break;
      case 'code':
        replacement = `\n\`\`\`\n${selection || '// code block'}\n\`\`\`\n`;
        break;
      case 'link':
        replacement = `[${selection || 'Link text'}](https://example.com)`;
        cursorOffset = selection ? 0 : -21;
        break;
      case 'image':
        replacement = `![${selection || 'Image description'}](/src/assets/images/mineral_samples_1783445814400.jpg)`;
        cursorOffset = selection ? 0 : -1;
        break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    // Maintain focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length + cursorOffset, start + replacement.length + cursorOffset);
    }, 50);
  };

  // Save / Publish Blog Post
  const handleSavePost = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitSuccess(null);

    const finalTitle = title.trim();
    const finalSlug = slug.trim().toLowerCase();
    const finalCategory = useCustomCategory ? customCategory.trim() : category;
    const finalSummary = summary.trim();
    const finalContent = content.trim();

    if (!finalTitle || !finalSlug || !finalCategory || !finalSummary || !finalContent) {
      setErrorMsg('Please populate all mandatory fields before publishing.');
      return;
    }

    setSubmitting(true);
    try {
      const displayDate = customDate || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const postData: Omit<BlogPost, 'id' | 'createdAt'> = {
        title: finalTitle,
        slug: finalSlug,
        summary: finalSummary,
        content: finalContent,
        category: finalCategory,
        date: displayDate,
        author: author.trim() || 'Abdul Rahman'
      };

      if (editingPostSlug) {
        // If the slug changed, delete old and create new to update key ID
        if (editingPostSlug !== finalSlug) {
          await deleteBlogPost(editingPostSlug);
        }
        await updateBlogPost(finalSlug, postData);
        setSubmitSuccess('Article updated and synchronized successfully!');
      } else {
        await createBlogPost(postData);
        setSubmitSuccess('New publication published and live in journal index!');
      }

      // Reset editor fields
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      setEditingPostSlug(null);
      setCustomDate('');
      setUseCustomCategory(false);
      setCustomCategory('');

      // Reload posts and switch tab
      await loadPosts();
      setTimeout(() => {
        setActiveTab('manage');
        setSubmitSuccess(null);
      }, 1500);

    } catch (err: any) {
      console.error('Submit error:', err);
      let errorText = 'Encountered Firestore permission rules block. Admin access required.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.error) errorText = `Database Error: ${parsed.error}`;
      } catch {}
      setErrorMsg(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPostSlug(post.slug);
    setTitle(post.title);
    setSlug(post.slug);
    setSummary(post.summary);
    setContent(post.content);
    setAuthor(post.author || 'Abdul Rahman');
    setCustomDate(post.date);
    
    if (categoriesList.includes(post.category)) {
      setCategory(post.category);
      setUseCustomCategory(false);
    } else {
      setCustomCategory(post.category);
      setUseCustomCategory(true);
    }

    setActiveTab('editor');
    window.scrollTo(0, 0);
  };

  const handleDeletePost = async (postSlug: string, postTitle: string) => {
    try {
      await deleteBlogPost(postSlug);
      toast.success(`Deleted "${postTitle}" successfully.`);
      await loadPosts();
    } catch (err: any) {
      toast.error('Failed to delete post. Permissions check failed.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted.');
      await loadComments();
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  // Custom render inside live preview
  const renderMarkdownPreview = (text: string) => {
    if (!text) return <p className="text-white/30 italic text-xs">Live markdown layout compiles here...</p>;
    
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('![') && line.trim().endsWith(')')) {
        const match = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const alt = match[1];
          const src = match[2];
          return (
            <div key={index} className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-1 max-w-lg">
              <img src={src} alt={alt} className="w-full h-auto rounded-xl object-cover max-h-[300px]" referrerPolicy="no-referrer" />
              {alt && <p className="text-center text-[10px] text-white/40 mt-2 font-mono">{alt}</p>}
            </div>
          );
        }
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-black mt-8 mb-4 text-white border-b border-indigo-500/20 pb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-white/90 border-b border-white/5 pb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-5 mb-2 text-white/80">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="list-disc ml-4 my-1 text-xs text-white/70">{line.replace('* ', '')}</li>;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={index} className="border-l-2 border-indigo-500 pl-3 py-1 my-4 bg-indigo-500/5 text-white/60 italic rounded-r-lg text-xs">{line.replace('> ', '')}</blockquote>;
      }
      if (line.trim() === '') return <div key={index} className="h-2"></div>;

      let styledLine = line;
      styledLine = styledLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
      styledLine = styledLine.replace(/\*(.*?)\*/g, '<em class="italic text-white/90">$1</em>');
      styledLine = styledLine.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-indigo-300 font-mono text-[10px]">$1</code>');

      return (
        <p key={index} className="text-xs text-white/70 leading-relaxed my-2 font-light" dangerouslySetInnerHTML={{ __html: styledLine }} />
      );
    });
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If loading authentication state, show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white/50 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <span className="text-xs uppercase tracking-widest font-mono">Verifying Access Auth...</span>
      </div>
    );
  }

  // LOGIN PORTAL (if not authorized)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans flex items-center justify-center p-6 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-indigo-950/25 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple-950/15 blur-[120px]" />
        </div>

        <div className="w-full max-w-md bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl text-center shadow-2xl relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
              <Shield size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Journal Administration</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              WordPress-style panel to manually create, edit, and delete research publications and moderate peer reviews.
            </p>
          </div>

          {/* Secure Publisher Verification Banner */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-left space-y-2">
            <h2 className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Exclusive Publishing Access</h2>
            <p className="text-[11px] text-white/60 leading-relaxed font-light">
              This control panel is restricted by Zero-Trust Cloud policies. Only the principal publisher account (<strong className="text-white font-mono">quanticschool@gmail.com</strong>) carries verification clearance to write and upload articles.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-[1.01]"
          >
            Authorize via Google Account
          </button>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to journal
          </Link>
        </div>
      </div>
    );
  }

  // ADMINISTRATIVE CONTROL PANEL VIEW
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-white selection:text-black pb-32">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-950/15 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-950/10 blur-[150px]" />
      </div>

      {/* Admin Navbar */}
      <nav className="fixed top-0 w-full px-6 py-4 md:px-16 flex justify-between items-center z-50 bg-[#0d0d0d]/90 backdrop-blur-sm border-b border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tighter">AR.</span>
          <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1">
            <Shield size={10} /> Publisher Dashboard
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/blog" className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5 font-semibold">
            <Eye size={14} /> Live Blog
          </Link>
          <button 
            onClick={handleLogout}
            className="px-4 py-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Admin Dashboard Workspace */}
      <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
        
        {/* Page Title & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-white/5 pb-8 pt-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">WordPress Publisher Control</h1>
            <p className="text-xs text-white/50">
              Manage journal drafts, review user contributions, and customize metallurgy insights in real-time.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
              <span className="block text-[10px] uppercase text-white/40 tracking-widest font-mono">Articles</span>
              <strong className="text-lg text-white font-bold">{posts.length}</strong>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
              <span className="block text-[10px] uppercase text-white/40 tracking-widest font-mono">Reviews</span>
              <strong className="text-lg text-white font-bold">{comments.length}</strong>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div className="flex gap-1.5 bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
            <button
              onClick={() => { setActiveTab('editor'); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle size={14} /> {editingPostSlug ? 'Edit Article' : 'Write Post'}
            </button>
            <button
              onClick={() => { setActiveTab('manage'); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'manage'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={14} /> Manage Posts
            </button>
            <button
              onClick={() => { setActiveTab('comments'); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'comments'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare size={14} /> Moderation Queue
            </button>
          </div>

          {activeTab === 'manage' && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search database articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            </div>
          )}
        </div>

        {/* WORKSPACE AREA CONTAINER */}
        <div className="min-h-[500px]">
          
          {/* TAB 1: RICH WRITER & EDITOR */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSavePost} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Input Block */}
              <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-indigo-400" />
                    {editingPostSlug ? 'Edit Article Draft' : 'Publish New Publication'}
                  </h3>
                  {editingPostSlug && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPostSlug(null);
                        setTitle('');
                        setSlug('');
                        setSummary('');
                        setContent('');
                        setCustomDate('');
                      }}
                      className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                      Cancel Edit Mode
                    </button>
                  )}
                </div>

                {/* Submit Feedback Banner */}
                <AnimatePresence>
                  {submitSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-xs text-emerald-300"
                    >
                      <Check className="text-emerald-400 shrink-0 animate-bounce" size={16} />
                      <span>{submitSuccess}</span>
                    </motion.div>
                  )}

                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center gap-3 text-xs text-red-300"
                    >
                      <AlertCircle className="text-red-400 shrink-0" size={16} />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Primary Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Article Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="E.g., Microstructural Optimization of Hydrogen Embrittlement"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">URL Permalinks (Slug)</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="microstructural-embrittlement-opt"
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Author Identity</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Abdul Rahman"
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Category options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Category Designation</label>
                      {!useCustomCategory ? (
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          {categoriesList.map(c => (
                            <option key={c} value={c} className="bg-neutral-900">{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="E.g., Electrochemistry & Tribology"
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required={useCustomCategory}
                        />
                      )}
                    </div>

                    <div className="flex items-center pb-2.5">
                      <label className="flex items-center gap-2.5 text-xs text-white/60 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useCustomCategory}
                          onChange={(e) => setUseCustomCategory(e.target.checked)}
                          className="rounded border-white/10 bg-[#050505] text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span>Enter custom classification</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Override Display Date (Optional)</label>
                      <input
                        type="text"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        placeholder="E.g., October 12, 2026 (blank for today)"
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="bg-[#050505] border border-white/5 rounded-2xl p-3 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-bold text-indigo-400 mb-0.5 tracking-wider font-mono">Image reference list</span>
                      <p className="text-[10px] text-white/50 leading-snug">
                        Copy to insert: <code className="text-white/80 select-all">![Map](/src/assets/images/pakistan_mineral_map_1783445793899.jpg)</code>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Brief Summary / Teaser</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Enter a scannable teaser describing the core discoveries or research methodology..."
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                      maxLength={1000}
                      required
                    />
                  </div>

                  {/* WordPress style toolbar & Editor */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Research Content (Markdown syntax)</label>
                      <div className="flex items-center gap-1.5 bg-[#050505] border border-white/10 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setEditorMode('write')}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            editorMode === 'write' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode('preview')}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            editorMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          Preview
                        </button>
                      </div>
                    </div>

                    {editorMode === 'write' ? (
                      <div className="space-y-1.5">
                        {/* Editor Formatting toolbar */}
                        <div className="flex flex-wrap gap-1 bg-white/[0.03] border border-white/10 p-1.5 rounded-xl">
                          <button type="button" onClick={() => insertMarkdown('bold')} title="Bold" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"><Bold size={13} /></button>
                          <button type="button" onClick={() => insertMarkdown('italic')} title="Italic" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"><Italic size={13} /></button>
                          <button type="button" onClick={() => insertMarkdown('heading')} title="Heading" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"><Heading2 size={13} /></button>
                          <button type="button" onClick={() => insertMarkdown('list')} title="Bullet List" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"><List size={13} /></button>
                          <button type="button" onClick={() => insertMarkdown('code')} title="Code Block" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"><Code size={13} /></button>
                          <button type="button" onClick={() => insertMarkdown('link')} title="Insert Link" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"><Link2 size={13} /></button>
                          <button type="button" onClick={() => insertMarkdown('image')} title="Insert Infographic Image" className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1"><ImageIcon size={13} /><span className="text-[8px] font-bold font-sans">IMG</span></button>
                        </div>
                        
                        <textarea
                          ref={textareaRef}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Write your beautiful Markdown formatted scientific content here..."
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 h-96 font-mono leading-relaxed"
                          required
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-[#050505] border border-white/10 rounded-xl p-6 h-96 overflow-y-auto prose prose-invert select-text">
                        {renderMarkdownPreview(content)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submits */}
                <div className="pt-4 border-t border-white/5 flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        {editingPostSlug ? 'Update Publication' : 'Publish Article Live'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sidebar Guide Block */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Editor Guidance */}
                <div className="bg-[#0d0d0d] border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-white">
                    <Settings size={16} className="text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Formatting Guideline</h4>
                  </div>
                  
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    This editor supports zero-dependency semantic Markdown parsing. You can format your scientific manuscripts using standard markup.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-white/80"># Header 1</span>
                      <span className="text-white/40 font-mono">Main Title</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-white/80">## Header 2</span>
                      <span className="text-white/40 font-mono">Sub-sections</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-white/80">**Double asterisks**</span>
                      <span className="text-white/40 font-mono">Bold highlight</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-white/80">*Single asterisk*</span>
                      <span className="text-white/40 font-mono">Italic style</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-white/80">`backticks`</span>
                      <span className="text-white/40 font-mono">Inline code</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-white/80">![caption](url)</span>
                      <span className="text-white/40 font-mono">Embedding Image</span>
                    </div>
                  </div>
                </div>

                {/* Available Assets Panel */}
                <div className="bg-[#0d0d0d] border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-white">
                    <ImageIcon size={16} className="text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Infographic Assets</h4>
                  </div>
                  
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Use these premium pre-compiled map & specimens collages generated specifically for Pakistani geological publications:
                  </p>

                  <div className="space-y-4">
                    <div className="border border-white/5 bg-white/[0.01] p-3 rounded-2xl space-y-2">
                      <img src={withBase("/src/assets/images/pakistan_mineral_map_1783445793899.jpg")} className="w-full h-24 object-cover rounded-xl" alt="Pakistan Map" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-indigo-300">Pakistan Mineral Map</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setContent(prev => prev + '\n![Mineral Map of Pakistan](/src/assets/images/pakistan_mineral_map_1783445793899.jpg)');
                          }}
                          className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded cursor-pointer"
                        >
                          + Insert Map
                        </button>
                      </div>
                    </div>

                    <div className="border border-white/5 bg-white/[0.01] p-3 rounded-2xl space-y-2">
                      <img src={withBase("/src/assets/images/mineral_samples_1783445814400.jpg")} className="w-full h-24 object-cover rounded-xl" alt="Specimens Collage" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-indigo-300">Specimen Samples Collage</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setContent(prev => prev + '\n![Mineral Specimen Samples of Pakistan](/src/assets/images/mineral_samples_1783445814400.jpg)');
                          }}
                          className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded cursor-pointer"
                        >
                          + Insert Samples
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          )}

          {/* TAB 2: POSTS DATABASE DIRECTORY */}
          {activeTab === 'manage' && (
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-400" />
                  Live Publication Database ({filteredPosts.length})
                </h3>
                <button
                  onClick={loadPosts}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="Synchronize Database"
                >
                  <RefreshCw size={14} className={loadingPosts ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <span className="text-xs uppercase tracking-widest font-mono">Syncing Firestore Records...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <Search size={32} className="mx-auto text-white/20 mb-3" />
                  <p className="text-xs text-white/50">No database publications match your search filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/80">
                    <thead className="bg-[#050505] text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Title</th>
                        <th className="py-3 px-4 font-semibold">Classification</th>
                        <th className="py-3 px-4 font-semibold">Author</th>
                        <th className="py-3 px-4 font-semibold">Publish Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredPosts.map((post) => (
                        <tr key={post.slug} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 font-medium text-white max-w-xs truncate">
                            <span className="block font-bold truncate">{post.title}</span>
                            <span className="block text-[10px] text-indigo-400 font-mono truncate">/{post.slug}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wide">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium">{post.author}</td>
                          <td className="py-4 px-4 text-white/50">{post.date}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link 
                                to={`/blog/${post.slug}`}
                                className="p-2 hover:bg-indigo-600/10 hover:text-indigo-400 rounded-xl transition-colors text-white/40"
                                title="View live"
                              >
                                <Eye size={14} />
                              </Link>
                              <button
                                onClick={() => handleEditClick(post)}
                                className="p-2 hover:bg-emerald-600/10 hover:text-emerald-400 rounded-xl transition-colors text-white/40 cursor-pointer"
                                title="Edit Content"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.slug, post.title)}
                                className="p-2 hover:bg-rose-600/10 hover:text-rose-400 rounded-xl transition-colors text-white/40 cursor-pointer"
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
              )}
            </div>
          )}

          {/* TAB 3: REVIEW MODERATION QUEUE */}
          {activeTab === 'comments' && (
            <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-400" />
                  Peer Review & Discussion Moderator ({comments.length})
                </h3>
                <button
                  onClick={loadComments}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="Refresh Reviews"
                >
                  <RefreshCw size={14} className={loadingComments ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingComments ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <span className="text-xs uppercase tracking-widest font-mono">Fetching Comment Threads...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <MessageSquare size={32} className="mx-auto text-white/20 mb-3" />
                  <p className="text-xs text-white/50">Your review moderator queue is empty. No comments logged.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-5 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <strong className="text-white flex items-center gap-1">
                            <User size={13} className="text-indigo-400" />
                            {comment.authorName}
                          </strong>
                          <span className="text-white/30">•</span>
                          <span className="text-indigo-400 text-[10px] font-mono uppercase tracking-wide">
                            Post: {comment.postId}
                          </span>
                          <span className="text-white/30">•</span>
                          <span className="text-white/40 font-mono text-[10px]">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed font-light italic pl-3 border-l border-white/10 max-w-2xl">
                          "{comment.content}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => handleDeleteComment(comment.id || '')}
                          className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-wider text-rose-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Spam / Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
