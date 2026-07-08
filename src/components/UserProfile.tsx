import { useState, FormEvent } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Shield, Check, AlertCircle, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile() {
  const { cmsUser, user, updateCmsProfile, loading, error } = useAuthStore();
  const [displayName, setDisplayName] = useState(cmsUser?.displayName || '');
  const [bio, setBio] = useState(cmsUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(cmsUser?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await updateCmsProfile(displayName.trim(), bio.trim(), avatarUrl.trim());
      toast.success('Your profile settings have been updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white dark:text-white bright:text-slate-900">
          Account Settings
        </h1>
        <p className="text-xs text-white/50 dark:text-white/50 bright:text-slate-500 mt-0.5 font-light">
          Manage your display settings, bio data, and visual avatar displayed on publications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card Summary */}
        <div className="md:col-span-4 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 rounded-3xl text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-black font-mono mx-auto shadow-md">
            {cmsUser?.displayName?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white dark:text-white bright:text-slate-900 uppercase">
              {cmsUser?.displayName || 'Publisher'}
            </h2>
            <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 dark:text-indigo-400 bright:text-indigo-600 text-[9px] uppercase tracking-wider font-bold mt-1.5 font-mono">
              {cmsUser?.role || 'Author'}
            </span>
          </div>
          <div className="border-t border-white/5 dark:border-white/5 bright:border-slate-100 pt-4 text-left">
            <span className="block text-[9px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold font-mono">
              Registered Email
            </span>
            <span className="block text-[11px] text-white/60 dark:text-white/60 bright:text-slate-600 truncate mt-1">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateProfile} className="md:col-span-8 bg-[#0d0d0d] dark:bg-[#0d0d0d] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white dark:text-white bright:text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-white/5">
            <User size={16} className="text-indigo-400" />
            Profile Information
          </h3>

          {error && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Display Name</label>
              <input
                type="text"
                placeholder="Abdul Rahman"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2.5 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Avatar Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/images/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl px-4 py-2.5 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 dark:text-white/40 bright:text-slate-400 font-bold">Short Biography</label>
              <textarea
                placeholder="Tell us about your professional or research focus..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#050505] dark:bg-[#050505] bright:bg-white border border-white/10 dark:border-white/10 bright:border-slate-200 rounded-xl p-4 text-xs text-white dark:text-white bright:text-slate-900 focus:outline-none focus:border-indigo-500 h-28 resize-none font-light leading-relaxed"
                maxLength={500}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 dark:border-t-white/5 bright:border-t-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={14} /> Update Profile Settings
                </>
              )}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
