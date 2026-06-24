import { motion } from 'motion/react';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { BlogPost } from '../lib/firebase';
import { Link } from 'react-router-dom';

interface BlogCardProps {
  key?: string | number;
  post: BlogPost;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative flex flex-col justify-between bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl p-6 md:p-8 transition-all hover:bg-white/10 duration-300 shadow-xl shadow-black/10"
    >
      <div className="space-y-4">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full font-medium">
            <Tag size={12} /> {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-white/40">
            <Calendar size={12} /> {post.date}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">
          {post.title}
        </h4>

        {/* Summary */}
        <p className="text-sm text-white/60 font-light leading-relaxed line-clamp-3">
          {post.summary}
        </p>
      </div>

      {/* Footer Link */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
          Authored by {post.author}
        </span>
        <Link 
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Read Article <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
