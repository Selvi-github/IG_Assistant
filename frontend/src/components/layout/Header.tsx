import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ShieldCheck, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { BrandOnboardingModal } from '@/components/onboarding/BrandOnboardingModal';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { connectedAccounts, brandKit, addToast } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Overview & Schedule' };
      case '/studio':
        return { title: 'AI Studio', subtitle: '4 Creation Modes' };
      case '/editor':
        return { title: 'Video & Carousel Studio', subtitle: 'Timeline & Templates' };
      case '/publisher':
        return { title: 'Publishing Hub', subtitle: 'Meta Graph Dispatch' };
      case '/accounts':
        return { title: 'Connected Accounts', subtitle: 'Meta OAuth Tokens' };
      case '/brand-kit':
        return { title: 'Brand Identity', subtitle: 'Colors, Logo & Voice' };
      case '/history':
        return { title: 'History & Vault', subtitle: 'Generated Assets' };
      case '/analytics':
        return { title: 'Analytics', subtitle: 'Reach & Retention' };
      case '/settings':
        return { title: 'Settings', subtitle: 'API Keys & Vault' };
      default:
        return { title: 'SocialCraft AI', subtitle: 'Meta Creator Studio' };
    }
  };

  const { title, subtitle } = getPageInfo();
  const isMetaConnected = connectedAccounts.some((a) => a.isConnected);

  return (
    <>
      <header className="h-16 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl px-6 flex items-center justify-between z-20 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Brand Setup Pill */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 hover:border-rose-500/40 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer"
            title="Configure Brand Profile"
          >
            <div className="ig-ring">
              <img
                src={brandKit.logoUrl}
                alt="Brand avatar"
                className="w-4 h-4 rounded-full object-cover"
              />
            </div>
            <span className="hidden sm:inline text-[11px]">{brandKit.brandName || 'Set Brand'}</span>
            <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Meta API Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">Meta API:</span>
            {isMetaConnected ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
            ) : (
              <span className="text-[11px] text-amber-500 font-medium">Offline</span>
            )}
          </div>

          {/* Bright / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => addToast('Meta publishing queue is operating smoothly.', 'info')}
            className="relative p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black" />
          </button>
        </div>
      </header>

      {/* Brand Setup Modal */}
      <BrandOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </>
  );
};
