import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, Sparkles, User, Info, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function CmsLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, error, clearError, loading } = useAuthStore();
  const { theme } = useUiStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  // Get path to redirect back to
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // Detect if inside an iframe (AI Studio Preview)
    setIsIframe(window.self !== window.top);

    // If already logged in, redirect directly
    if (user) {
      navigate(from, { replace: true });
    }
    clearError();
  }, [user, navigate, from, clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (isResetMode) {
      try {
        await resetPassword(email);
        setResetSuccess(true);
        toast.success('Password reset link dispatched to your inbox.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to dispatch password reset link.');
      }
    } else if (isSignUpMode) {
      try {
        // Enforce the authorized email address for registration to match admin policies
        if (email.trim().toLowerCase() !== 'quanticschool@gmail.com') {
          toast.error('Only authorized principal email (quanticschool@gmail.com) can be registered as administrator.');
          return;
        }

        await signUpWithEmail(email, password, displayName || 'Abdul Rahman', 'admin');
        toast.success('Administrator account registered and authorized successfully!');
        navigate(from, { replace: true });
      } catch (err: any) {
        toast.error(err.message || 'Registration failed. Try again.');
      }
    } else {
      try {
        await signInWithEmail(email, password);
        toast.success('Logged in successfully!');
        navigate(from, { replace: true });
      } catch (err: any) {
        toast.error(err.message || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    try {
      await signInWithGoogle();
      toast.success('Authenticated via Google OAuth!');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Give very specific helpful advice for iframe OAuth errors
      if (err.code === 'auth/popup-blocked') {
        toast.error('OAuth Popup Blocked. Please click the "Open in New Tab" button on the top right to authenticate.');
      } else {
        toast.error(err.message || 'Google OAuth authentication failed. Try using Email/Password instead.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans flex items-center justify-center p-6 relative">
      {/* Background decorations matching the Cosmic design philosophy */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[20%] w-[350px] h-[350px] rounded-full bg-indigo-950/20 blur-[100px]" />
        <div className="absolute bottom-[15%] right-[20%] w-[350px] h-[350px] rounded-full bg-purple-950/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isResetMode ? 'Reset Credentials' : isSignUpMode ? 'Register Administrator' : 'Journal Gateway'}
          </h1>
          <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
            {isResetMode 
              ? 'Enter your publisher email address to request a verification key reset.' 
              : isSignUpMode
              ? 'Register your administrator account to manage journal articles directly.'
              : 'Sign in to access your dashboard and publish research content.'
            }
          </p>
        </div>

        {/* Dynamic Sandbox/iFrame Warning Notice */}
        {isIframe && !isResetMode && (
          <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl flex items-start gap-3 text-[11px] text-indigo-200">
            <Info className="text-indigo-400 shrink-0 mt-0.5" size={15} />
            <div className="space-y-1">
              <span className="font-bold block">AI Studio Preview detected</span>
              <p className="text-white/60 leading-normal">
                Browser security rules often block Google popup logins inside iframes. 
                If sign-in fails, please click the <strong className="text-indigo-300">Open in New Tab</strong> button on the top right to authenticate seamlessly, or register an email/password account below.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Password Reset Success Banner */}
        {isResetMode && resetSuccess && (
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={14} />
            <span>Check your email inbox for resetting instructions. You can now toggle back to sign in.</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUpMode && (
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Abdul Rahman"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 font-semibold"
                  required={isSignUpMode}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder={isSignUpMode ? "quanticschool@gmail.com" : "publisher@domain.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            </div>
            {isSignUpMode && (
              <p className="text-[9px] text-indigo-400 font-mono">
                Note: Must be <strong>quanticschool@gmail.com</strong> for publisher privileges.
              </p>
            )}
          </div>

          {!isResetMode && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Passkey</label>
                {!isSignUpMode && (
                  <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold tracking-wide"
                  >
                    Forgot Key?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUpMode ? "Choose a secure password..." : "Enter secret passkey..."}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Authorizing...
              </>
            ) : (
              <>{isResetMode ? 'Send Reset Link' : isSignUpMode ? 'Register Administrator' : 'Secure Authorization'}</>
            )}
          </button>
        </form>

        {!isResetMode && (
          <div className="text-center text-xs pt-1">
            <span className="text-white/40">
              {isSignUpMode ? 'Already have an administrator account? ' : "Don't have an email/password login? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                clearError();
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              {isSignUpMode ? 'Sign In' : 'Register Email'}
            </button>
          </div>
        )}

        {!isResetMode && !isSignUpMode && (
          <>
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-[#0d0d0d] px-3 text-[10px] uppercase tracking-widest text-white/30 font-bold">Or authorize via</span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Google OAuth Sign In
            </button>
          </>
        )}

        {isResetMode && (
          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setResetSuccess(false);
            }}
            className="w-full py-2 bg-white/[0.02] border border-white/5 hover:bg-white/5 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Back to Gate Sign In
          </button>
        )}

        <div className="text-center pt-2">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to journal
          </Link>
        </div>

      </div>
    </div>
  );
}
