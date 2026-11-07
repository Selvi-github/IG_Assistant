import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { CreationMode, GeneratedPost } from '@/types';
import {
  Clock,
  Search,
  Video,
  Image as ImageIcon,
  Send,
  Edit3,
  Copy,
  Trash2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const HistoryPage: React.FC = () => {
  const { posts, setActiveDraft, deletePost, addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<CreationMode | 'all'>('all');

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = selectedMode === 'all' || post.creationMode === selectedMode;
    return matchesSearch && matchesMode;
  });

  const handleEdit = (post: GeneratedPost) => {
    setActiveDraft(post);
    navigate('/editor');
  };

  const handlePublish = (post: GeneratedPost) => {
    setActiveDraft(post);
    navigate('/publisher');
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    addToast('Caption copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>AI Asset Vault</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Generation History & Vault
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            All scripts, scene prompts, generated vertical reels, and carousels created in the studio.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
          {posts.length} Items Total
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scripts, captions..."
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'text', label: 'Mode A' },
            { id: 'image', label: 'Mode B' },
            { id: 'video', label: 'Mode C' },
            { id: 'reference', label: 'Mode D' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id as CreationMode | 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedMode === mode.id
                  ? 'ig-gradient text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Past Creations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-3.5">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-md ${
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

                <div className="absolute top-2.5 right-2.5 p-1 rounded bg-black/60 text-white backdrop-blur-xs text-[10px]">
                  {post.postType === 'reel' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                </div>
              </div>

              <h3 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">{post.title}</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {formatDate(post.createdAt)} · {post.scenes?.length || 1} scenes
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {post.caption}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleCopyCaption(post.caption)}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(post)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer border border-zinc-200 dark:border-white/5"
                >
                  <Edit3 className="w-3 h-3 text-rose-500" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handlePublish(post)}
                  className="p-1.5 rounded-lg ig-gradient text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Publish / Schedule"
                >
                  <Send className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
