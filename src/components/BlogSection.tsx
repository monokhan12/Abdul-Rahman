import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBlogPosts, BlogPost, seedDefaultPostsIfEmpty } from '../lib/firebase';
import BlogCard from './BlogCard';

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Seed default database posts if completely empty on load
        await seedDefaultPostsIfEmpty();
        const data = await getBlogPosts();
        // Limit to 3 recent posts for the homepage section
        setPosts(data.slice(0, 3));
      } catch (err) {
        console.error('Error in BlogSection loading:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section id="blog" className="py-32 px-6 md:px-16 z-10 relative bg-[#050505] border-b border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs uppercase tracking-widest text-indigo-300 mb-6 inline-block">
              Research & Insights
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              Scientific Blog
            </h2>
            <p className="text-lg text-white/50 font-light leading-relaxed">
              Explorations spanning materials informatics, solid-state regeneration, and physical metallurgy workflows.
            </p>
          </div>

          <Link
            to="/blog"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-widest rounded-full transition-all shrink-0 shadow-lg shadow-white/5 hover:scale-[1.02] cursor-pointer"
          >
            <BookOpen size={16} /> View All Posts <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
            <span className="text-xs uppercase tracking-widest font-semibold font-mono">Loading articles...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center max-w-md mx-auto">
            <p className="text-white/60 mb-2 font-medium">No publications posted yet.</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Check back soon for insights on materials science & physical metallurgy.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <BlogCard key={post.id || post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
