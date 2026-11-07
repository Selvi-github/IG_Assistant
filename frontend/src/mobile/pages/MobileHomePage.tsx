import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';
import { formatDate } from '@/lib/utils';

export const MobileHomePage: React.FC = () => {
  const { brandKit, connectedAccounts, posts, deletePost } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const igAccount = connectedAccounts.find((a) => a.platform === 'instagram' && a.isConnected);
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'published');

  // Compute first letter fallback
  const firstLetter = (brandKit.brandName || user?.fullName || 'C')[0].toUpperCase();

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Brand Hero Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-3">
          {/* Logo with First Letter Fallback */}
          <div className="shrink-0">
            {brandKit.logoUrl ? (
              <div className="ig-ring">
                <img
                  src={brandKit.logoUrl}
                  alt={brandKit.brandName}
                  className="w-13 h-13 rounded-full object-cover border-2 border-white dark:border-black"
                />
              </div>
            ) : (
              <div className="w-13 h-13 rounded-full ig-gradient flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white dark:border-zinc-900">
                {firstLetter}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black text-zinc-900 dark:text-white truncate">
              {brandKit.brandName || user?.brandName || 'My Brand'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <InstagramIcon className="w-3.5 h-3.5 text-[#fb2175] shrink-0" />
              <span className="text-xs font-semibold text-[#fb2175] truncate">
                {brandKit.handle || user?.instagramHandle || (igAccount ? `@${igAccount.username}` : '@creator')}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
              {brandKit.description || 'AI-Powered Creator Studio'}
            </p>
          </div>
        </div>

        {/* Create Post Hero Button */}
        <button
          onClick={() => navigate('/studio')}
          className="w-full mt-2 py-3 px-4 rounded-2xl ig-gradient text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Daily Post</span>
        </button>
      </div>

      {/* Quick Summary Pill Strip */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => navigate('/publisher')}
          className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled</span>
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">{scheduledPosts.length}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Ready for Instagram dispatch</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Published</span>
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">{publishedPosts.length}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Live on your feed</p>
        </div>
      </div>

      {/* Recent Posts Stream */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Posts</h3>
          <span className="text-[10px] text-zinc-400">{posts.length} total</span>
        </div>

        {posts.length === 0 ? (
          /* Empty State for Newly Registered Users */
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-center space-y-3">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No posts created yet</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Your published and scheduled Instagram posts will appear here once created.
              </p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              className="py-2.5 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all inline-flex items-center gap-1.5 cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Your First Post</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{post.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                            post.status === 'published'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : post.status === 'scheduled'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {post.status}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost(post.id);
                          }}
                          className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{post.caption}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {post.status === 'published' ? `Published ${formatDate(post.updatedAt)}` : 'Ready to post'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
