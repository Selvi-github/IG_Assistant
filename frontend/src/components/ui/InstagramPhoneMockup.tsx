import React, { useEffect, useState } from 'react';
import type { GeneratedPost, ScriptScene } from '@/types';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Volume2,
  ThumbsUp,
  Share2,
  Globe,
} from 'lucide-react';

interface InstagramPhoneMockupProps {
  post: Partial<GeneratedPost>;
  currentScene?: ScriptScene;
  mode?: 'reel' | 'post' | 'facebook';
  interactive?: boolean;
}

export const InstagramPhoneMockup: React.FC<InstagramPhoneMockupProps> = ({
  post,
  currentScene,
  mode = 'reel',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const images = post.mediaUrls && post.mediaUrls.length > 0
    ? post.mediaUrls
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'];

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [images.join('|')]);

  const currentImage = images[activeSlideIndex] || images[0];
  const likesCount = (post.analytics?.likes || 3420) + (isLiked ? 1 : 0);

  const displayText = currentScene?.onScreenText || (post.scenes && post.scenes[0]?.onScreenText) || post.title;
  const textPos = currentScene?.textPosition || 'center';

  return (
    <div className="relative mx-auto w-[310px] sm:w-[340px] aspect-[9/19] bg-black rounded-[46px] p-3 shadow-2xl border-[4px] border-zinc-800 phone-mockup-shadow select-none flex flex-col justify-between overflow-hidden">
      {/* Dynamic Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-26 h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
        <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-indigo-950" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute top-3 left-7 right-7 flex justify-between items-center text-[10px] font-semibold text-white/90 z-20 pointer-events-none">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]">5G</span>
          <div className="w-4.5 h-2 border border-white/80 rounded-xs p-[1px] flex items-center">
            <div className="h-full w-full bg-white rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Screen Container */}
      <div className="relative w-full h-full bg-zinc-950 rounded-[38px] overflow-hidden flex flex-col pt-7 pb-2 text-white">
        {mode === 'reel' ? (
          // ================= REEL VIEW =================
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Visual Media */}
            <div className="absolute inset-0 z-0">
              <img
                src={currentImage}
                alt="Reel visual"
                className="w-full h-full object-cover brightness-[0.92]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* Reel Header */}
            <div className="relative z-10 px-4 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold tracking-wide flex items-center gap-1.5 drop-shadow-md">
                <span>Reels</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider font-semibold">
                  AI
                </span>
              </span>
              <button className="p-1 rounded-full bg-black/30 backdrop-blur-md text-white/90">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center Dynamic On-Screen Text Overlay */}
            <div
              className={`relative z-10 px-5 flex flex-col transition-all duration-300 ${
                textPos === 'top'
                  ? 'justify-start pt-10'
                  : textPos === 'bottom'
                  ? 'justify-end pb-24'
                  : 'justify-center my-auto'
              }`}
            >
              {displayText && (
                <div className="mx-auto max-w-[270px] text-center">
                  <div className="inline-block px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 shadow-xl">
                    <p className="font-extrabold text-xs uppercase tracking-wider text-white drop-shadow-md leading-tight">
                      {displayText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-3.5 text-white">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex flex-col items-center gap-0.5 group active:scale-125 transition-transform"
              >
                <div className={`p-1.5 rounded-full ${isLiked ? 'text-rose-500' : 'text-white'} drop-shadow`}>
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[10px] font-medium drop-shadow">{likesCount}</span>
              </button>

              <button className="flex flex-col items-center gap-0.5">
                <div className="p-1.5 text-white drop-shadow">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium drop-shadow">{post.analytics?.comments || 148}</span>
              </button>

              <button className="flex flex-col items-center gap-0.5">
                <div className="p-1.5 text-white drop-shadow">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium drop-shadow">{post.analytics?.shares || 620}</span>
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className="flex flex-col items-center gap-0.5"
              >
                <div className={`p-1.5 ${isSaved ? 'text-amber-400' : 'text-white'} drop-shadow`}>
                  <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[10px] font-medium drop-shadow">{post.analytics?.saves || 940}</span>
              </button>

              {/* Music Disc */}
              <div className="w-7 h-7 rounded-full border-2 border-white/60 bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center animate-spin [animation-duration:8s]">
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-white" />
              </div>
            </div>

            {/* Reel Bottom Details & Audio */}
            <div className="relative z-10 p-4 pb-2 pr-14 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="ig-ring">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover border border-black"
                  />
                </div>
                <span className="text-xs font-semibold drop-shadow">aurastudio.ai</span>
                <button className="text-[9px] font-semibold border border-white/50 px-2 py-0.2 rounded-md backdrop-blur-xs">
                  Follow
                </button>
              </div>

              <div className="text-[10px] text-zinc-200 drop-shadow line-clamp-2 leading-relaxed">
                <span>{post.caption || 'Creating viral hooks that capture attention with SocialCraft AI.'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] text-white/90">
                <Music2 className="w-3 h-3 animate-pulse" />
                <span className="truncate max-w-[170px]">Trending Lofi Beats · Original Audio</span>
              </div>
            </div>
          </div>
        ) : mode === 'post' ? (
          // ================= FEED POST / CAROUSEL =================
          <div className="relative w-full h-full flex flex-col justify-between text-white overflow-y-auto">
            <div>
              <div className="px-3 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="ig-ring">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover border border-black"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold">aurastudio.ai</span>
                    <span className="block text-[8px] text-zinc-400">Sponsored</span>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-zinc-400" />
              </div>

              {/* Feed Image Area */}
              <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden group">
                <img
                  src={currentImage}
                  alt="Post visual"
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-medium text-white">
                      {activeSlideIndex + 1}/{images.length}
                    </div>

                    {activeSlideIndex > 0 && (
                      <button
                        onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/60 text-white"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {activeSlideIndex < images.length - 1 && (
                      <button
                        onClick={() => setActiveSlideIndex((prev) => Math.min(images.length - 1, prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/60 text-white"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Action Icons */}
              <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsLiked(!isLiked)} className="active:scale-125 transition-transform">
                    <Heart className={`w-4.5 h-4.5 ${isLiked ? 'text-rose-500 fill-current' : 'text-zinc-200'}`} />
                  </button>
                  <MessageCircle className="w-4.5 h-4.5 text-zinc-200" />
                  <Send className="w-4.5 h-4.5 text-zinc-200" />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-1">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === activeSlideIndex ? 'w-2.5 bg-rose-500' : 'w-1.5 bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <button onClick={() => setIsSaved(!isSaved)}>
                  <Bookmark className={`w-4.5 h-4.5 ${isSaved ? 'text-amber-400 fill-current' : 'text-zinc-200'}`} />
                </button>
              </div>

              <div className="px-3 text-[10px] font-semibold text-zinc-200">
                {likesCount.toLocaleString()} likes
              </div>

              <div className="px-3 py-1 text-[10px] text-zinc-300 leading-snug">
                <span className="font-semibold text-white mr-1.5">aurastudio.ai</span>
                <span className={showFullCaption ? '' : 'line-clamp-2'}>
                  {post.caption || 'High-converting social content generated with SocialCraft AI.'}
                </span>
                {!showFullCaption && (
                  <button
                    onClick={() => setShowFullCaption(true)}
                    className="text-zinc-500 text-[9px] font-medium ml-1"
                  >
                    more
                  </button>
                )}
                <div className="mt-1 flex flex-wrap gap-1 text-[9px] text-rose-400">
                  {post.hashtags?.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-3 pb-2 text-[8px] text-zinc-500 uppercase tracking-wider font-semibold">
              {post.status === 'published' ? 'Published via Meta API' : 'Ready to Publish'}
            </div>
          </div>
        ) : (
          // ================= FACEBOOK POST VIEW (ZERO EMOJIS) =================
          <div className="relative w-full h-full flex flex-col justify-between text-white p-3 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Aura Studio Page</div>
                  <div className="text-[9px] text-zinc-400 flex items-center gap-1">
                    <span>Just now</span>
                    <span>·</span>
                    <Globe className="w-2.5 h-2.5 text-zinc-400" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-200 mb-2 leading-relaxed">
                {post.caption || 'High quality social post generated with SocialCraft AI.'}
              </p>

              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 mb-2">
                <img src={currentImage} alt="Facebook media" className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 py-1 border-t border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                    </span>
                    <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center">
                      <Heart className="w-2.5 h-2.5 text-white fill-white" />
                    </span>
                  </div>
                  <span>{post.analytics?.likes || 280}</span>
                </div>
                <div>{post.analytics?.comments || 34} comments</div>
              </div>
            </div>

            <div className="flex items-center justify-around border-t border-zinc-800 pt-2 text-[11px] text-zinc-300">
              <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Like</span>
              </span>
              <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Comment</span>
              </span>
              <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Home bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-20 pointer-events-none" />
    </div>
  );
};
