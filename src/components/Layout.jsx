import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, LayoutDashboard, Settings, Github } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';

export function Layout() {
  const { theme, setTheme } = useStore();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-50 flex flex-col">
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="SmartAttend Logo" className="w-8 h-8 drop-shadow-md" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              SmartAttend
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 mr-4">
              <Link to="/" className={`text-sm font-medium transition-colors hover:text-violet-600 dark:hover:text-violet-400 ${location.pathname === '/' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
                Dashboard
              </Link>
              <Link to="/settings" className={`text-sm font-medium transition-colors hover:text-violet-600 dark:hover:text-violet-400 ${location.pathname === '/settings' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
                Settings
              </Link>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col justify-between">
        <div className="w-full flex-1">
          <Outlet />
        </div>

        {/* Footer positioned inside main layout flow for guaranteed rendering & alignment */}
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md py-6 mt-16 pb-24 md:pb-6 text-center text-xs text-slate-500 font-medium rounded-3xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>&copy; {new Date().getFullYear()} SmartAttend. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <span>Developed by</span>
              <a 
                href="https://github.com/Amansharmacs1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline font-bold"
              >
                <Github className="w-3.5 h-3.5" /> Amansharmacs1
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile navigation tab bar */}
      <div className="fixed bottom-0 left-0 w-full md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-safe z-40">
        <div className="flex justify-around p-3">
          <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center gap-1 ${location.pathname === '/settings' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
