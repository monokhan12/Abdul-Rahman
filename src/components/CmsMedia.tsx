import { useState } from 'react';
import { Image as ImageIcon, Copy, Check, Trash2, FolderPlus, Grid, List, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CmsMedia() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const mediaAssets = [
    {
      id: '1',
      name: 'pakistan_mineral_map_1783445793899.jpg',
      url: '/src/assets/images/pakistan_mineral_map_1783445793899.jpg',
      size: '1.2 MB',
      dimensions: '1920x1080',
      createdAt: 'Jul 04, 2026'
    },
    {
      id: '2',
      name: 'mineral_samples_1783445814400.jpg',
      url: '/src/assets/images/mineral_samples_1783445814400.jpg',
      size: '850 KB',
      dimensions: '1200x800',
      createdAt: 'Jul 04, 2026'
    }
  ];

  const handleCopyLink = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    toast.success('Asset markdown link copied!');
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white dark:text-white bright:text-slate-900">
            Media Asset Library
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-500 mt-0.5 font-light">
            Upload, inspect, catalog, and reference high-resolution research infographics.
          </p>
        </div>

        <button
          onClick={() => toast.info('Firebase Storage upload will be activated in Phase 3.')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <FolderPlus size={14} /> Upload Media Asset
        </button>
      </div>

      {/* Library Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-4 rounded-2xl shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search catalogued files..."
            className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 dark:text-white/30 bright:text-slate-400" />
        </div>

        {/* Views toggler */}
        <div className="flex items-center gap-2 bg-white/[0.02] dark:bg-white/[0.02] bright:bg-slate-50 border border-white/10 dark:border-white/10 bright:border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setLayoutMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'grid' 
                ? 'bg-indigo-600 text-white' 
                : 'text-white/40 hover:text-white'
            }`}
            title="Grid Layout"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setLayoutMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'list' 
                ? 'bg-indigo-600 text-white' 
                : 'text-white/40 hover:text-white'
            }`}
            title="List Layout"
          >
            <List size={14} />
          </button>
        </div>

      </div>

      {/* ASSET CONTAINER */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaAssets.map((asset, i) => (
            <div 
              key={asset.id}
              className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 rounded-2xl overflow-hidden shadow-lg group relative flex flex-col justify-between"
            >
              <div className="aspect-video w-full bg-[#050505] border-b border-white/5 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={asset.url} 
                  alt={asset.name} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-white dark:text-white bright:text-slate-800 truncate" title={asset.name}>
                    {asset.name}
                  </span>
                  <div className="flex justify-between items-center text-[10px] text-white/40 dark:text-white/40 bright:text-slate-400 font-mono font-semibold">
                    <span>{asset.dimensions}</span>
                    <span>{asset.size}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 dark:border-t-white/5 bright:border-t-slate-100 flex gap-2">
                  <button
                    onClick={() => handleCopyLink(`![${asset.name}](${asset.url})`, i)}
                    className="flex-1 py-1.5 bg-white/5 dark:bg-white/5 bright:bg-slate-50 border border-white/10 dark:border-white/10 bright:border-slate-200 hover:bg-white/10 dark:hover:bg-white/10 bright:hover:bg-slate-100 text-white/70 dark:text-white/70 bright:text-slate-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check size={11} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy MD
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => toast.error('Standard asset deletion requires elevated Storage credentials.')}
                    className="p-1.5 hover:bg-rose-500/10 text-white/30 dark:text-white/30 bright:text-slate-400 hover:text-rose-400 border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-white/80 dark:text-white/80 bright:text-slate-600">
            <thead className="bg-[#050505] dark:bg-[#050505] bright:bg-slate-50 text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 border-b border-white/5 dark:border-white/5 bright:border-slate-200">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Asset Preview</th>
                <th className="py-3.5 px-4 font-semibold">Dimensions</th>
                <th className="py-3.5 px-4 font-semibold">Size</th>
                <th className="py-3.5 px-4 font-semibold">Added Date</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 dark:divide-white/5 bright:divide-slate-100">
              {mediaAssets.map((asset, i) => (
                <tr key={asset.id} className="hover:bg-white/[0.01] dark:hover:bg-white/[0.01] bright:hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6 flex items-center gap-3">
                    <img src={asset.url} className="w-10 h-10 object-cover rounded-lg border border-white/10" alt="" />
                    <span className="font-bold text-white dark:text-white bright:text-slate-800">{asset.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-white/50">{asset.dimensions}</td>
                  <td className="py-3 px-4 font-mono text-white/50">{asset.size}</td>
                  <td className="py-3 px-4 text-white/40">{asset.createdAt}</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(`![${asset.name}](${asset.url})`, i)}
                        className="px-2.5 py-1.5 border border-white/10 rounded-lg text-[10px] font-bold uppercase hover:bg-white/5 flex items-center gap-1"
                      >
                        {copiedIndex === i ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        Copy Link
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
  );
}
