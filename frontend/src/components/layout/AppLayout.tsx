import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Home,
  Plus,
  Clock,
  User,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';

// Dedicated mobile components
import { SplashScreen } from '@/mobile/components/SplashScreen';
import { MobileAuthPage } from '@/mobile/pages/MobileAuthPage';
import { MobileHomePage } from '@/mobile/pages/MobileHomePage';
import { MobileCreatePostPage } from '@/mobile/pages/MobileCreatePostPage';
import { MobileQueuePage } from '@/mobile/pages/MobileQueuePage';
import { MobileBrandSetupPage } from '@/mobile/pages/MobileBrandSetupPage';

export const AppLayout: React.FC = () => {
  const isMobile = useIsMobile(768);
  const location = useLocation();
  const navigate = useNavigate();
  const { brandKit, connectedAccounts, hasBrandProfile } = useApp();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const igAccount = connectedAccounts.find((a) => a.platform === 'instagram' && a.isConnected);
  const firstLetter = (brandKit.brandName || user?.fullName || 'C')[0].toUpperCase();

  // Show clean spinner while checking active session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-pink-400 border-t-[#fb2175] animate-spin" />
        <span className="text-xs font-semibold text-zinc-500">Loading IG Assistant...</span>
      </div>
    );
  }

  // Route protection: If user is not authenticated, display login interface
  if (!isAuthenticated) {
    if (isMobile) {
      return (
        <MobileAuthPage
          onSuccess={() => {
            navigate('/dashboard');
          }}
        />
      );
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // =========================================================================
  // AUTOMATIC MOBILE LAYOUT (Active on mobile screens < 768px)
  // =========================================================================
  if (isMobile) {
    // Check if the user has completed the Brand & Profile Setup form
    const isOnboarded = hasBrandProfile || localStorage.getItem('ig_assistant_onboarded') === 'true';

    // 3. Brand & Profile Setup Form (Active if new user or on brand edit route)
    const isBrandSetupRoute =
      location.pathname === '/brand-kit' ||
      location.pathname === '/accounts' ||
      location.pathname === '/settings' ||
      location.pathname === '/mobile/brand';

    const isCreateRoute =
      location.pathname === '/studio' ||
      location.pathname === '/editor' ||
      location.pathname === '/mobile/create';

    const isQueueRoute =
      location.pathname === '/publisher' ||
      location.pathname === '/history' ||
      location.pathname === '/analytics' ||
      location.pathname === '/mobile/queue';

    // If new user has not completed onboarding form yet, show form first before home page
    if (!isOnboarded) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-4 selection:bg-rose-500 selection:text-white transition-colors">
          <header className="h-12 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 px-2 mb-3">
            <span className="text-xs font-bold ig-gradient-text">IG Assistant · Onboarding</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10"
              title="Toggle Bright/Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto">
            <MobileBrandSetupPage
              onComplete={() => {
                navigate('/dashboard');
              }}
            />
          </main>

          <ToastContainer />
        </div>
      );
    }

    // 4. Mobile Home Page & Bottom Navigation Tabs (After Onboarding)
    const renderMobileContent = () => {
      if (isBrandSetupRoute) {
        return <MobileBrandSetupPage onComplete={() => navigate('/dashboard')} />;
      }
      if (isCreateRoute) {
        return <MobileCreatePostPage />;
      }
      if (isQueueRoute) {
        return <MobileQueuePage />;
      }
      return <MobileHomePage />;
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white transition-colors">
        {/* Mobile Sticky Brand Header */}
        <header className="sticky top-0 z-40 h-14 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {brandKit.logoUrl ? (
              <div className="ig-ring shrink-0">
                <img
                  src={brandKit.logoUrl}
                  alt="Brand logo"
                  className="w-7 h-7 rounded-full object-cover border border-white dark:border-black"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 border border-white dark:border-black">
                {firstLetter}
              </div>
            )}
            <div className="min-w-0 truncate">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-tight">
                {brandKit.brandName || user?.brandName || 'My Brand'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                <span className="truncate">
                  {brandKit.handle || user?.instagramHandle || (igAccount ? `@${igAccount.username}` : '@creator')}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 transition-colors cursor-pointer"
              title="Toggle Bright/Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
            </button>

            <button
              onClick={logout}
              className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-rose-500 border border-zinc-200 dark:border-white/10 transition-colors cursor-pointer"
              title="Sign Out (View Image 2 Screen)"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile Main Body */}
        <main className="flex-1 pb-24 p-4 overflow-y-auto">
          {renderMobileContent()}
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 px-6 flex items-center justify-around">
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              !isCreateRoute && !isQueueRoute && !isBrandSetupRoute
                ? 'text-rose-500 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          {/* Elevated Create Button */}
          <button
            type="button"
            onClick={() => navigate('/studio')}
            className="flex flex-col items-center gap-1 group -mt-5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full ig-gradient flex items-center justify-center text-white shadow-lg ig-glow-sm group-active:scale-95 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className={`text-[10px] font-bold ${isCreateRoute ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-200'}`}>
              Create
            </span>
          </button>

          {/* Queue Tab */}
          <button
            type="button"
            onClick={() => navigate('/publisher')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              isQueueRoute
                ? 'text-rose-500 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Queue</span>
          </button>

          {/* Brand Tab */}
          <button
            type="button"
            onClick={() => navigate('/brand-kit')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              isBrandSetupRoute
                ? 'text-rose-500 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Brand</span>
          </button>
        </nav>

        <ToastContainer />
      </div>
    );
  }

  // =========================================================================
  // AUTOMATIC DESKTOP STUDIO LAYOUT (Active on laptop/desktop screens >= 768px)
  // =========================================================================
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-black text-zinc-900 dark:text-slate-100 transition-colors">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Desktop Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-50/60 dark:bg-black transition-colors">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
