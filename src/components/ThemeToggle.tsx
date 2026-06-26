import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'bright' | 'dark'>(() => {
    return (localStorage.getItem('abdul_rahman_theme') as 'bright' | 'dark') || 'bright';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('abdul_rahman_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'bright' ? 'dark' : 'bright'));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle visual theme"
      className="fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border border-white/20 hover:scale-105"
    >
      {theme === 'bright' ? (
        <>
          <Moon size={16} /> Dark Mode
        </>
      ) : (
        <>
          <Sun size={16} className="text-yellow-300" /> Bright Theme
        </>
      )}
    </button>
  );
}
