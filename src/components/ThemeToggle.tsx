import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('abdul_rahman_theme');
    if (saved === 'light' || saved === 'bright') return 'light';
    if (saved === 'dark') return 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
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
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      id="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border hover:scale-105 ${
        theme === 'dark'
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-white/20 shadow-indigo-600/30'
          : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-slate-900/15'
      }`}
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

