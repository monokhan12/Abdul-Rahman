import { create } from 'zustand';

interface UiState {
  theme: 'bright' | 'dark';
  sidebarOpen: boolean;
  activeNav: string;
  setTheme: (theme: 'bright' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveNav: (nav: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: (localStorage.getItem('abdul_rahman_theme') as 'bright' | 'dark') || 'bright',
  sidebarOpen: true,
  activeNav: 'dashboard',

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('abdul_rahman_theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'bright' ? 'dark' : 'bright';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('abdul_rahman_theme', nextTheme);
      return { theme: nextTheme };
    });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveNav: (nav) => set({ activeNav: nav })
}));
