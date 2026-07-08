import { useState, FormEvent } from 'react';
import { FolderTree, Plus, Trash2, Edit, RefreshCw, FolderOpen, Tag, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  count: number;
}

export default function CmsCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: '1', name: 'Computational Materials Science', slug: 'computational-materials-science', description: 'Quantum mechanical calculations and crystal structure simulations.', color: '#6366f1', count: 4 },
    { id: '2', name: 'Sustainable Materials', slug: 'sustainable-materials', description: 'Eco-friendly metallurgic compounds, green cements, and composites.', color: '#10b981', count: 3 },
    { id: '3', name: 'Agentic AI', slug: 'agentic-ai', description: 'Large action models and automated robotic synthesis pipelines.', color: '#8b5cf6', count: 2 },
    { id: '4', name: 'Physical Metallurgy', slug: 'physical-metallurgy', description: 'Thermal annealing, deformation modeling, and mechanical testing.', color: '#3b82f6', count: 2 }
  ]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    
    const newCategory: CategoryItem = {
      id: Date.now().toString(),
      name: name.trim(),
      slug,
      description: description.trim(),
      color,
      count: 0
    };

    setTimeout(() => {
      setCategories([newCategory, ...categories]);
      setName('');
      setDescription('');
      setColor('#6366f1');
      setSaving(false);
      toast.success('Category taxonomy added securely.');
    }, 400);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white dark:text-white bright:text-slate-900">
          Categories Taxonomy
        </h1>
        <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-500 mt-0.5 font-light">
          Manage publication disciplines, sorting tags, and organizational structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CREATE FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-4 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white dark:text-white bright:text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/5 dark:border-b-white/5 bright:border-b-slate-100">
            <Plus size={16} className="text-indigo-400" />
            Add New Taxonomy
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Taxonomy Name</label>
              <input
                type="text"
                placeholder="E.g., Quantum Chemistry"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Taxonomy Theme Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-8 bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-1 text-xs text-indigo-300 font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Description (Optional)</label>
              <textarea
                placeholder="Enter a brief sorting description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl p-3 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 h-24 resize-none font-light"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Register Taxonomy'}
          </button>
        </form>

        {/* LIST TABLE */}
        <div className="lg:col-span-8 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white dark:text-white bright:text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/5 dark:border-b-white/5 bright:border-b-slate-100">
            <FolderTree size={16} className="text-indigo-400" />
            Registered Taxonomies ({categories.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className="p-4 bg-white/[0.01] dark:bg-white/[0.01] bright:bg-slate-50 border border-white/5 dark:border-white/5 bright:border-slate-200/60 rounded-2xl flex flex-col justify-between gap-3 shadow-sm relative group"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span 
                      className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                      style={{ color: cat.color, backgroundColor: `${cat.color}0a`, borderColor: `${cat.color}22` }}
                    >
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white/30 dark:text-white/30 bright:text-slate-400 uppercase">
                      {cat.count} Articles
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 dark:text-white/50 bright:text-slate-500 font-light leading-relaxed">
                    {cat.description || 'No custom sorting description registered.'}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-white/5 dark:border-white/5 bright:border-slate-200/80">
                  <span className="text-[9px] font-mono text-white/30 dark:text-white/30 bright:text-slate-400 truncate">
                    /{cat.slug}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 hover:bg-rose-500/10 text-white/30 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
