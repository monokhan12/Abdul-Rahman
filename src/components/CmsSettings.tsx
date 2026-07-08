import { useState, useEffect, FormEvent } from 'react';
import { Settings, Save, Globe, Info, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export default function CmsSettings() {
  const [siteName, setSiteName] = useState('Abdul Rahman');
  const [siteDescription, setSiteDescription] = useState('Geological Science & Material Science Research Portfolio');
  const [contactEmail, setContactEmail] = useState('abdulrahmana18@pm.me');
  const [metaTitle, setMetaTitle] = useState('Abdul Rahman - Research Journal');
  const [metaDescription, setMetaDescription] = useState('Computational materials science and physical metallurgy research publications.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSiteName(data.siteName || '');
          setSiteDescription(data.siteDescription || '');
          setContactEmail(data.contactEmail || '');
          setMetaTitle(data.globalSeo?.metaTitle || '');
          setMetaDescription(data.globalSeo?.metaDescription || '');
        }
      } catch (err) {
        console.warn('Could not read settings document from Firestore. Using defaults.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, {
        siteName,
        siteDescription,
        contactEmail,
        globalSeo: {
          metaTitle,
          metaDescription,
        },
        updatedAt: Timestamp.now()
      }, { merge: true });

      toast.success('Global CMS settings synchronized successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to sync settings. Ensure security rules allow write access.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <span className="text-xs uppercase tracking-widest font-mono">Loading CMS configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white dark:text-white bright:text-slate-900">
          CMS Configuration
        </h1>
        <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-500 mt-0.5 font-light">
          Synchronize site titles, global contact links, and SEO metadata with the core hosting pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core settings */}
        <div className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white dark:text-white bright:text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-white/5 dark:border-b-white/5 bright:border-b-slate-100">
            <Globe size={16} className="text-indigo-400" />
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Site Title</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2.5 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Primary Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2.5 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Site Description / Tagline</label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl p-4 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 h-20 resize-none font-light"
              required
            />
          </div>
        </div>

        {/* Global SEO */}
        <div className="bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white dark:text-white bright:text-slate-950 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-white/5 dark:border-b-white/5 bright:border-b-slate-100">
            <Sparkles size={16} className="text-yellow-400" />
            Global SEO Optimization
          </h3>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Meta Title</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2.5 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Meta Description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl p-4 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 h-24 resize-none font-light leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Form submit button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Syncing settings...
              </>
            ) : (
              <>
                <Save size={14} /> Synchronize CMS Settings
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
