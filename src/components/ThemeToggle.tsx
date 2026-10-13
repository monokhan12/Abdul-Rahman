import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('abdul_rahman_theme');
  if (saved === 'light' || saved === 'bright') return 'light';
  if (saved === 'dark') return 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
  localStorage.setItem('abdul_rahman_theme', theme);
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
}

interface ThemeToggleProps {
  variant?: 'floating' | 'nav' | 'mobile';
  className?: string;
}

export default function ThemeToggle({ variant = 'floating', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const currentTheme = getInitialTheme();
    setTheme(currentTheme);
    applyTheme(currentTheme);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: 'dark' | 'light' }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  if (variant === 'nav') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className={`p-2 rounded-full border transition-all hover:scale-105 cursor-pointer flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 border-white/15 text-yellow-300'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-600'
        } ${className}`}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    );
  }

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
            : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
        } ${className}`}
      >
        <span className="flex items-center gap-2">
          {theme === 'dark' ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-indigo-600" />}
          <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
        </span>
        <span className="text-xs uppercase font-mono tracking-wider opacity-60">
          {theme}
        </span>
      </button>
    );
  }

  return (
    <button
      id="theme-toggle-button"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border hover:scale-105 ${
        theme === 'dark'
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-white/20 shadow-indigo-600/30'
          : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-slate-900/15'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={16} className="text-yellow-300" />
          <span>Light Theme</span>
        </>
      ) : (
        <>
          <Moon size={16} className="text-indigo-600" />
          <span>Dark Theme</span>
        </>
      )}
    </button>
  );
}
