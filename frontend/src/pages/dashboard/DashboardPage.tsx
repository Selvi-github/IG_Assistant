import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Send,
  Clock,
  FileEdit,
  TrendingUp,
  Workflow,
  Image as ImageIcon,
  Video,
  Type,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import { formatNumber, formatDate } from '@/lib/utils';
import { BrandOnboardingModal } from '@/components/onboarding/BrandOnboardingModal';

export const DashboardPage: React.FC = () => {
  const { posts, connectedAccounts, brandKit, setActiveDraft } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const totalCount = posts.length;
  const totalReach = posts.reduce((sum, p) => sum + (p.analytics?.reach || 0), 0);

  const igAccount = connectedAccounts.find((a) => a.platform === 'instagram');
  const fbAccount = connectedAccounts.find((a) => a.platform === 'facebook');

  const handleOpenStudio = (mode: 'text' | 'image' | 'video' | 'reference') => {
    navigate(`/studio?mode=${mode}`);
  };

  const handleEditPost = (post: typeof posts[0]) => {
    setActiveDraft(post);
    navigate('/editor');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-sm transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {brandKit.brandName || 'Aura Studio'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {brandKit.handle || '@aurastudio.ai'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Welcome back, <span className="ig-gradient-text">{user?.fullName || 'Creator'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              You have <strong className="text-zinc-900 dark:text-white">{scheduledCount} posts queued</strong> for automated Meta Graph publishing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleOpenStudio('text')}
              className="px-5 py-3 rounded-xl ig-gradient text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Reel</span>
            </button>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Edit Brand</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Content</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">{totalCount}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+12%</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Reels and Carousels</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Published</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <InstagramIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{publishedCount}</span>
            <span className="text-[10px] text-zinc-500">Meta Verified</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Active on Instagram</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Queue Scheduled</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{scheduledCount}</span>
            <span className="text-[10px] text-zinc-500">Peak Delivery</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Ready for auto-post</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Estimated Reach</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {formatNumber(totalReach || 48900)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> 28.4%
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Monthly impressions</p>
        </div>
      </div>

      {/* Connected Accounts Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Channels:</span>

          <div className="flex items-center gap-2.5">
            <div className="ig-ring">
              <img
                src={igAccount?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt="IG"
                className="w-7 h-7 rounded-full object-cover border border-white dark:border-black"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">@{igAccount?.username}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">{formatNumber(igAccount?.followersCount || 38400)} followers</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0">
              <FacebookIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{fbAccount?.accountName}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Page
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">{formatNumber(fbAccount?.followersCount || 14200)} likes</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/accounts')}
          className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Tokens</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 AI Modes Quick Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">AI Content Creation Studio</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Select a creation format to generate with AI</p>
          </div>
          <button
            onClick={() => navigate('/studio')}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            Open Studio
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleOpenStudio('text')}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 hover:border-rose-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Type className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Mode A: Text to Content</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Generate full video script, hooks, and viral captions from a single concept.
            </p>
          </div>

          <div
            onClick={() => handleOpenStudio('image')}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Mode B: Image to Carousel</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Analyze photos and generate structured high-retention multi-slide carousels.
            </p>
          </div>

          <div
            onClick={() => handleOpenStudio('video')}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Mode C: Video to Reel</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Slice raw video into scenes with animated captions and 9:16 vertical styling.
            </p>
          </div>

          <div
            onClick={() => handleOpenStudio('reference')}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Workflow className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Mode D: Reference Clone</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Reverse-engineer viral pacing to create a copyright-safe original reel.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Instagram Profile Grid & Upcoming Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3-Column Instagram Profile Feed Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <InstagramIcon className="w-4 h-4 text-rose-500" />
              <span>Instagram Profile Grid</span>
            </h2>
            <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/5 font-medium">
              3-Column Feed
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
            {/* Profile Mini Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="ig-ring">
                  <img
                    src={brandKit.logoUrl || igAccount?.avatarUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-black"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    {brandKit.handle || '@aurastudio.ai'}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{brandKit.brandName}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{posts.length} posts</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Sync Active</p>
              </div>
            </div>

            {/* 3-Column Posts Grid */}
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleEditPost(post)}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                >
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white backdrop-blur-xs text-[10px]">
                    {post.postType === 'reel' ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                  </div>

                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider backdrop-blur-md ${
                        post.status === 'published'
                          ? 'bg-emerald-500/80 text-white'
                          : post.status === 'scheduled'
                          ? 'bg-amber-500/80 text-white'
                          : 'bg-zinc-700/80 text-zinc-200'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold text-xs">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>{formatNumber(post.analytics?.likes || 420)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>{post.analytics?.comments || 28}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scheduled Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Upcoming Queue</span>
            </h3>
            <button
              onClick={() => navigate('/publisher')}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium"
            >
              View all
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            {posts
              .filter((p) => p.status === 'scheduled' || p.status === 'draft')
              .slice(0, 3)
              .map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleEditPost(post)}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                          post.status === 'scheduled'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {post.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {post.scheduledTime ? formatDate(post.scheduledTime) : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Brand Onboarding Modal */}
      <BrandOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
