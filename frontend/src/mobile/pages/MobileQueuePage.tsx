import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  Send,
  Trash2,
  Calendar,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const MobileQueuePage: React.FC = () => {
  const { posts, publishPostNow, deletePost, addToast } = useApp();
  const navigate = useNavigate();

  const scheduledPosts = posts.filter((p) => p.status === 'scheduled');

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Scheduled Queue</h2>
          <p className="text-xs text-zinc-500">Automated posts scheduled for Instagram</p>
        </div>
        <button
          onClick={() => navigate('/studio')}
          className="p-2 rounded-xl ig-gradient text-white shadow-xs cursor-pointer"
          title="New Post"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {scheduledPosts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No Scheduled Posts</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Create a post and select a time to queue automated daily publishing.
            </p>
          </div>
          <button
            onClick={() => navigate('/studio')}
            className="px-4 py-2 rounded-xl ig-gradient text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Post</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{post.scheduledTime ? formatDate(post.scheduledTime) : 'Today'}</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">{post.title}</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{post.caption}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => publishPostNow(post.id)}
                  className="px-3.5 py-1.5 rounded-xl ig-gradient text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Publish Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

