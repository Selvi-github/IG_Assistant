import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Film,
  Send,
  Users2,
  Palette,
  Clock,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { connectedAccounts, brandKit } = useApp();
  const navigate = useNavigate();

  const igAccount = connectedAccounts.find((a) => a.platform === 'instagram' && a.isConnected);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Studio', path: '/studio', icon: Cpu, badge: '4 Modes' },
    { name: 'Video Editor', path: '/editor', icon: Film },
    { name: 'Publishing & Queue', path: '/publisher', icon: Send },
    { name: 'Connected Accounts', path: '/accounts', icon: Users2 },
    { name: 'Brand Kit', path: '/brand-kit', icon: Palette },
    { name: 'History & Vault', path: '/history', icon: Clock },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-[#07080b] border-r border-zinc-200 dark:border-white/10 flex flex-col justify-between shrink-0 select-none transition-colors">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl ig-gradient flex items-center justify-center text-white shadow-md ig-glow-sm">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>SocialCraft</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full ig-gradient text-white font-black uppercase tracking-wider">
                AI
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Meta & Instagram Studio</p>
          </div>
        </div>

        {/* Quick Account Pill */}
        <div className="mx-4 mb-4 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <img
                src={brandKit?.logoUrl || igAccount?.avatarUrl}
                alt="Account avatar"
                className="w-7 h-7 rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {brandKit?.handle || (igAccount ? `@${igAccount.username}` : '@creator')}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Meta Connected
              </p>
            </div>
          </div>
          <NavLink to="/accounts" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <ChevronRight className="w-4 h-4" />
          </NavLink>
        </div>

        {/* Primary Action Button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => navigate('/studio')}
            className="w-full py-2.5 px-4 rounded-xl ig-gradient text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Content</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-white/10">
        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.fullName || 'User'}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-white/20"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">{user?.fullName || 'Creator'}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{user?.email || 'alex@socialcraft.ai'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
