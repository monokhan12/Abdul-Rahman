import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { withBase } from '../lib/withBase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  MessageSquare, 
  Send, 
  Loader2, 
  AlertCircle,
  Clock,
  Shield,
  CheckCircle,
  ExternalLink,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getBlogPostBySlug, 
  getComments, 
  createComment, 
  BlogPost, 
  BlogComment,
  auth
} from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import ThemeToggle from './ThemeToggle';

// Helper for inline markdown formatting
const formatInline = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-white/90">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs border border-white/5">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline font-medium underline-offset-2">$1</a>');
};

// Rich Markdown renderer with tables, code blocks, checklists, images, and blockquotes
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushCodeBlock = (key: string | number) => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <div key={`code-${key}`} className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 p-4 font-mono text-xs md:text-sm text-indigo-200 overflow-x-auto shadow-inner">
          {codeBlockLang && (
            <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 font-sans">
              {codeBlockLang}
            </div>
          )}
          <pre className="leading-relaxed">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
    }
    inCodeBlock = false;
    codeBlockLang = '';
  };

  const flushTable = (key: string | number) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter(r => !r.every(cell => cell.trim().match(/^:?-+:?$/)));
      elements.push(
        <div key={`tbl-${key}`} className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="p-3 md:p-4 font-bold text-white tracking-wide" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 md:p-4 text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inTable) flushTable(`before-code-${index}`);
      if (inCodeBlock) {
        flushCodeBlock(index);
      } else {
        inCodeBlock = true;
        codeBlockLang = trimmed.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Markdown Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // Images: ![alt](url)
    if (trimmed.startsWith('![') && trimmed.endsWith(')')) {
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const alt = match[1];
        let src = match[2];
        // Allow automatic fallback if path is relative
        return elements.push(
          <div key={`img-${index}`} className="my-8 rounded-3xl overflow-hidden border border-white/10 bg-white/5 p-2">
            <img 
              src={withBase(src)} 
              alt={alt} 
              loading="lazy"
              onError={(e) => {
                // Fallback to /images/ if /src/assets/images/ fails
                const target = e.currentTarget;
                if (src.includes('/src/assets/images/')) {
                  target.src = withBase(src.replace('/src/assets/images/', '/images/'));
                }
              }}
              className="w-full h-auto rounded-2xl object-cover max-h-[520px]" 
            />
            {alt && (
              <p className="text-center text-xs text-white/40 mt-3 font-mono">
                {alt}
              </p>
            )}
          </div>
        );
      }
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      return elements.push(<hr key={`hr-${index}`} className="my-10 border-white/10" />);
    }

    // Headings
    if (line.startsWith('# ')) {
      return elements.push(
        <h1 key={`h1-${index}`} className="text-3xl md:text-4xl font-black mt-12 mb-6 text-white border-b-2 border-indigo-500/30 pb-3 tracking-tight">
          {line.replace('# ', '')}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return elements.push(
        <h2 key={`h2-${index}`} className="text-2xl md:text-3xl font-extrabold mt-10 mb-5 text-white/90 border-b border-white/10 pb-2 tracking-tight">
          {line.replace('## ', '')}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return elements.push(
        <h3 key={`h3-${index}`} className="text-xl md:text-2xl font-bold mt-8 mb-4 text-white/80 tracking-tight">
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('#### ')) {
      return elements.push(
        <h4 key={`h4-${index}`} className="text-lg font-bold mt-6 mb-3 text-indigo-400 tracking-tight">
          {line.replace('#### ', '')}
        </h4>
      );
    }

    // Key takeaway checkmark items: ✔
    if (line.startsWith('✔ ') || trimmed.startsWith('✔')) {
      const itemContent = line.replace(/^[✔\s]+/, '');
      return elements.push(
        <div key={`check-${index}`} className="flex items-start gap-3 my-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <Check size={16} className="text-emerald-400 mt-1 shrink-0" />
          <span 
            className="text-sm md:text-base text-white/90 leading-relaxed font-normal"
            dangerouslySetInnerHTML={{ __html: formatInline(itemContent) }}
          />
        </div>
      );
    }

    // Unordered lists: * or -
    if (line.startsWith('* ') || line.startsWith('- ')) {
      const itemContent = line.replace(/^[\*\-]\s+/, '');
      return elements.push(
        <li key={`ul-${index}`} className="list-disc ml-6 my-2 text-sm md:text-base text-white/80 leading-relaxed pl-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(itemContent) }} />
        </li>
      );
    }

    // Numbered lists: 1.
    if (line.match(/^\d+\.\s/)) {
      const itemContent = line.replace(/^\d+\.\s/, '');
      return elements.push(
        <li key={`ol-${index}`} className="list-decimal ml-6 my-2 text-sm md:text-base text-white/80 leading-relaxed pl-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(itemContent) }} />
        </li>
      );
    }

    // Blockquote: >
    if (line.startsWith('> ')) {
      return elements.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-indigo-500 pl-4 py-3 my-6 bg-indigo-500/5 text-white/80 italic rounded-r-xl">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('> ', '')) }} />
        </blockquote>
      );
    }

    // Empty line
    if (trimmed === '') {
      return elements.push(<div key={`sp-${index}`} className="h-4" />);
    }

    // Standard paragraph
    return elements.push(
      <p 
        key={`p-${index}`} 
        className="text-sm md:text-base text-white/70 leading-relaxed my-3 font-light"
        dangerouslySetInnerHTML={{ __html: formatInline(line) }}
      />
    );
  });

  if (inCodeBlock) flushCodeBlock('end');
  if (inTable) flushTable('end');

  return elements;
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  
  // Loading states
  const [loadingPost, setLoadingPost] = useState<boolean>(true);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form input
  const [commentText, setCommentText] = useState<string>('');
  const [commenterName, setCommenterName] = useState<string>('');

  useEffect(() => {
    // Track auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.displayName) {
        setCommenterName(user.displayName);
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadPostData = async () => {
      if (!slug) return;
      setLoadingPost(true);
      setError(null);
      try {
        const article = await getBlogPostBySlug(slug);
        if (!article) {
          setError('Article not found.');
          setPost(null);
        } else {
          setPost(article);
          // Fetch comments
          loadComments(article.id || slug);
        }
      } catch (err: any) {
        setError('Failed to fetch the blog post.');
      } finally {
        setLoadingPost(false);
      }
    };

    loadPostData();
  }, [slug]);

  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setCurrentUser(result.user);
      if (result.user.displayName) {
        setCommenterName(result.user.displayName);
      }
      toast.success(`Signed in as ${result.user.displayName || result.user.email}`);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', err);
        toast.error('Google sign-in was not completed.');
      }
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim() || !commenterName.trim()) return;

    setSubmittingComment(true);
    try {
      await createComment({
        postId: post.id || post.slug,
        authorName: commenterName.trim(),
        content: commentText.trim()
      });
      
      setCommentText('');
      toast.success('Comment posted successfully!');
      // Reload comments
      await loadComments(post.id || post.slug);
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      toast.error('Could not submit comment. Please check your network connection.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white/50 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <span className="text-xs uppercase tracking-widest font-mono">Retrieving Article...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h4 className="text-2xl font-black mb-2">Failed to load publication</h4>
        <p className="text-white/60 mb-8 max-w-sm text-sm font-light">
          {error || 'This article might have been moved or deleted.'}
        </p>
        <Link 
          to="/blog"
          className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors"
        >
          Return to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black pb-32">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[130px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-6 md:px-16 flex justify-between items-center z-50 bg-[#050505]/75 backdrop-blur-sm text-white border-b border-white/5 shadow-lg shadow-black/10">
        <Link to="/" className="text-2xl font-bold tracking-tighter">AR.</Link>
        <div className="flex gap-4 md:gap-8 text-xs font-semibold uppercase tracking-[0.2em] items-center">
          <ThemeToggle variant="nav" />
          <Link to="/blog" className="hover:text-indigo-400 transition-colors text-indigo-300">Blog</Link>
          <Link to="/" className="hover:text-indigo-400 transition-colors">Portfolio</Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 pt-36 relative z-10">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to all articles
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 text-xs mb-6">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full font-medium uppercase tracking-wide">
              <Tag size={12} /> {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-white/40">
              <Calendar size={12} /> {post.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 border-y border-white/5 py-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
              AR
            </div>
            <div>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Materials Informatics & Metallurgy Specialist</p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert max-w-none mb-16 border-b border-white/5 pb-16">
          {renderMarkdown(post.content)}
        </article>

        {/* Comments Section */}
        <section className="mt-16">
          <h3 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-2.5">
            <MessageSquare size={22} className="text-indigo-400" /> Discussion ({comments.length})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Comment Submission Form */}
            <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 h-fit">
              <h4 className="text-base font-bold mb-4">Leave a Comment</h4>
              
              {!currentUser ? (
                <div className="text-center py-6">
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">
                    Authenticate securely with your Google Account to participate in discussions and provide scientific review.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white text-black hover:bg-neutral-200 transition-colors rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
                  >
                    Connect via Google
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  {/* Current User Info Banner */}
                  <div className="flex items-center gap-2.5 p-3 bg-[#050505] border border-white/5 rounded-xl text-xs">
                    <CheckCircle size={14} className="text-indigo-400 shrink-0" />
                    <span className="text-white/60">Signed in as <strong className="text-white">{currentUser.displayName}</strong></span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Your Name</label>
                    <input 
                      type="text" 
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      placeholder="Commenter Name"
                      className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5">Comment</label>
                    <textarea 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your constructive thoughts, questions, or reviews..."
                      className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 h-28 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Post Comment
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Comments List */}
            <div className="lg:col-span-6 space-y-4">
              {loadingComments ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/40 gap-2">
                  <Loader2 className="animate-spin text-indigo-500" size={20} />
                  <span className="text-[10px] uppercase tracking-widest font-mono">Syncing comments...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center">
                  <MessageSquare size={24} className="text-white/20 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white/50 mb-1">No comments yet</p>
                  <p className="text-[10px] text-white/30">Be the first to share your perspective on this work.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white/90 flex items-center gap-1.5">
                          <User size={12} className="text-indigo-400" /> {comment.authorName}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-light break-words pl-4 border-l border-white/5">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
