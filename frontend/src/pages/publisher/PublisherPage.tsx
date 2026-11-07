import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { InstagramPhoneMockup } from '@/components/ui/InstagramPhoneMockup';
import type { SocialPlatform, PostStatus } from '@/types';
import {
  Send,
  Calendar,
  Clock,
  RefreshCw,
  TrendingUp,
  Trash2,
  Check,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import { formatDate } from '@/lib/utils';

export const PublisherPage: React.FC = () => {
  const { posts, activeDraft, publishPostNow, schedulePost, deletePost, addToast } = useApp();

  const [selectedPostId, setSelectedPostId] = useState<string>(
    activeDraft?.id || (posts[0] ? posts[0].id : '')
  );

  const selectedPost = posts.find((p) => p.id === selectedPostId) || posts[0];

  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>(['instagram', 'facebook']);
  const [scheduleDateTime, setScheduleDateTime] = useState('2026-11-06T18:30');
  const [previewPlatform, setPreviewPlatform] = useState<'reel' | 'post' | 'facebook'>('reel');
  const [isPublishing, setIsPublishing] = useState(false);
  const [queueFilter, setQueueFilter] = useState<PostStatus | 'all'>('all');

  const togglePlatform = (plat: SocialPlatform) => {
    if (targetPlatforms.includes(plat)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter((p) => p !== plat));
      } else {
        addToast('At least one social platform must be selected.', 'warning');
      }
    } else {
      setTargetPlatforms([...targetPlatforms, plat]);
    }
  };

  const handlePublishNow = async () => {
    if (!selectedPost) return;
    setIsPublishing(true);
    await publishPostNow(selectedPost.id);
    setIsPublishing(false);

    // Copy caption to clipboard and redirect to Instagram
    try {
      await navigator.clipboard.writeText(selectedPost.caption);
    } catch {}

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://camera';
    } else {
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  const handleScheduleSubmit = () => {
    if (!selectedPost) return;
    schedulePost(selectedPost.id, new Date(scheduleDateTime).toISOString());
  };

  const handleQuickPeakTime = (hoursFromNow: number) => {
    const target = new Date(Date.now() + hoursFromNow * 3600000);
    setScheduleDateTime(target.toISOString().slice(0, 16));
    addToast('Set schedule to recommended peak audience window.', 'info');
  };

  const filteredPosts = queueFilter === 'all'
    ? posts
    : posts.filter((p) => p.status === queueFilter);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Meta Graph Publishing Engine</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Publishing & Scheduling Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Dispatch directly to Instagram Business & Facebook Pages with immediate publishing or peak-time scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-white/5">
          <span className="text-xs text-zinc-500">Scheduled in queue:</span>
          <span className="text-sm font-bold text-amber-500">
            {posts.filter((p) => p.status === 'scheduled').length} posts
          </span>
        </div>
      </div>

      {/* Main Publishing Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side */}
        <div className="lg:col-span-7 space-y-5">
          {/* Post Selection */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Select Post to Dispatch ({posts.length})
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {posts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPostId(p.id)}
                  className={`p-2.5 rounded-2xl border min-w-[150px] max-w-[180px] shrink-0 cursor-pointer transition-all ${
                    p.id === selectedPost?.id
                      ? 'bg-rose-500/10 border-rose-500 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20'
                  }`}
                >
                  <img src={p.thumbnailUrl} alt={p.title} className="w-full h-18 object-cover rounded-xl mb-1.5" />
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{p.title}</p>
                  <span
                    className={`inline-block text-[8px] font-semibold px-1.5 py-0.2 rounded mt-1 ${
                      p.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : p.status === 'scheduled'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Channels */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Target Channels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => togglePlatform('instagram')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  targetPlatforms.includes('instagram')
                    ? 'border-rose-500 bg-rose-500/10 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl ig-gradient text-white shadow-xs">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Instagram Business</p>
                    <p className="text-[10px] text-zinc-400">Reels & Carousels</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    targetPlatforms.includes('instagram') ? 'bg-rose-500 text-white' : 'border border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {targetPlatforms.includes('instagram') && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div
                onClick={() => togglePlatform('facebook')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  targetPlatforms.includes('facebook')
                    ? 'border-blue-500 bg-blue-500/10 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#1877f2] text-white shadow-xs">
                    <FacebookIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Facebook Page</p>
                    <p className="text-[10px] text-zinc-400">Page Feed & Reels</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    targetPlatforms.includes('facebook') ? 'bg-blue-500 text-white' : 'border border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {targetPlatforms.includes('facebook') && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Action Dispatch */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">Immediate Dispatch</p>
                <p className="text-[11px] text-zinc-500">Publish right now via official Meta API</p>
              </div>
              <button
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Publish Now</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Or Schedule for Specific Time
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleScheduleSubmit}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Set Schedule</span>
                </button>
              </div>

              {/* Peak Engagement Shortcuts */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2 font-medium">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                  <span>AI Recommended Peak Times</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickPeakTime(4)}
                    className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
                  >
                    Tonight at 6:45 PM
                  </button>
                  <button
                    onClick={() => handleQuickPeakTime(18)}
                    className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
                  >
                    Tomorrow at 8:15 AM
                  </button>
                  <button
                    onClick={() => handleQuickPeakTime(32)}
                    className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5"
                  >
                    Friday at 7:00 PM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dual Preview Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Mockup</span>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-white/10 text-xs">
              <button
                onClick={() => setPreviewPlatform('reel')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  previewPlatform === 'reel' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                }`}
              >
                Reel
              </button>
              <button
                onClick={() => setPreviewPlatform('post')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  previewPlatform === 'post' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                }`}
              >
                Feed Post
              </button>
              <button
                onClick={() => setPreviewPlatform('facebook')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  previewPlatform === 'facebook' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                }`}
              >
                Facebook
              </button>
            </div>
          </div>

          {selectedPost && (
            <InstagramPhoneMockup
              post={selectedPost}
              mode={previewPlatform}
            />
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Publishing Status Monitor</h3>
            <p className="text-xs text-zinc-500">Track Meta Graph API background jobs</p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'scheduled', 'published', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setQueueFilter(filter)}
                className={`px-3 py-1 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  queueFilter === filter
                    ? 'ig-gradient text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-white/5">
          {filteredPosts.map((post) => (
            <div key={post.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{post.title}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {post.postType.toUpperCase()} ·{' '}
                    {post.status === 'published'
                      ? `Published ${post.publishedTime ? formatDate(post.publishedTime) : ''}`
                      : post.status === 'scheduled'
                      ? `Scheduled for ${post.scheduledTime ? formatDate(post.scheduledTime) : ''}`
                      : 'Draft'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    post.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : post.status === 'scheduled'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {post.status}
                </span>

                {post.status !== 'published' && (
                  <button
                    onClick={() => publishPostNow(post.id)}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-rose-500 text-xs transition-colors cursor-pointer"
                    title="Publish now"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
