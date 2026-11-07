import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Home,
  Plus,
  Clock,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useNavigate } from 'react-router-dom';

export const MobileLayout: React.FC = () => {
  const { brandKit, connectedAccounts } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const igAccount = connectedAccounts.find((a) => a.platform === 'instagram' && a.isConnected);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white transition-colors">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="ig-ring shrink-0">
            <img
              src={brandKit.logoUrl || igAccount?.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
              alt="Brand logo"
              className="w-7 h-7 rounded-full object-cover border border-white dark:border-black"
            />
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-tight">
              {brandKit.brandName || 'My Brand'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
              <span className="truncate">{brandKit.handle || (igAccount ? `@${igAccount.username}` : '@creator')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
          </button>
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 pb-24 p-4 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 px-6 flex items-center justify-around">
        <NavLink
          to="/mobile"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/mobile/create"
          className="flex flex-col items-center gap-1 group -mt-5"
        >
          <div className="w-12 h-12 rounded-full ig-gradient flex items-center justify-center text-white shadow-lg ig-glow-sm group-active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">Create</span>
        </NavLink>

        <NavLink
          to="/mobile/queue"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span>Queue</span>
        </NavLink>

        <NavLink
          to="/mobile/brand"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Brand</span>
        </NavLink>
      </nav>

      <ToastContainer />
    </div>
  );
};
