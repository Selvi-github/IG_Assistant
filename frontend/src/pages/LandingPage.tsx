import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  PenTool,
  Palette,
  Calendar,
  Sun,
  Moon,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Video,
  Volume2,
  Sliders,
  Type,
  Subtitles,
  FileText,
  Plus,
  Scissors,
  Trash2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Settings,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Music,
  Check,
  ExternalLink,
  Users,
  Layers,
  Activity,
  Globe,
  Radio,
  Send,
  Sparkles as SparklesDummy, // NOT USED
  Clock,
  Layers3,
  Hash,
  Smartphone,
  Eye,
  RefreshCw,
  ChevronDown,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';
import { useTheme } from '@/context/ThemeContext';

export const LandingPage: React.FC = () => {
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<'prompt' | 'captions' | 'brand' | 'audio' | 'aspect'>('captions');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [publisherTarget, setPublisherTarget] = useState<{ igFeed: boolean; igReel: boolean; fbPage: boolean }>({
    igFeed: true,
    igReel: true,
    fbPage: false,
  });

  // If viewed on a mobile device, redirect to mobile app flow
  if (isMobile) {
    return <Navigate to="/dashboard" replace />;
  }

  // Ticker marquee items showcasing live SocialCraft AI creation workflows
  const tickerItems = [
    {
      type: 'AI Viral Hook',
      category: 'Reels',
      tagColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      title: '3 AI tools you need to stop wasting hours on manual Instagram creation',
      metric: '94.2k views',
    },
    {
      type: 'Carousel Slide 1/5',
      category: 'Growth',
      tagColor: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
      title: 'The Organic Instagram Engagement Blueprint for Direct Brands',
      metric: '+318% reach',
    },
    {
      type: 'Audio Recommendation',
      category: 'Trending',
      tagColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      title: 'Trending Lo-Fi Beat 124 BPM (Matched to high-retention video rhythm)',
      metric: '98.4k reels this week',
    },
    {
      type: 'Brand Kit Engine',
      category: 'Identity',
      tagColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
      title: 'Auto-applied primary HEX #5B21B6, logo watermark & brand typography',
      metric: '1-Click Match',
    },
    {
      type: 'Peak-Hour Scheduler',
      category: 'Direct Post',
      tagColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      title: 'Scheduled for 6:30 PM peak engagement window via Meta Graph v21.0',
      metric: 'Official Meta Partner',
    },
    {
      type: 'Hashtag Clustering',
      category: 'Discovery',
      tagColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      title: 'Calculated 15 low-competition niche tags with 84% search discovery',
      metric: 'Explore placement',
    },
    {
      type: 'Visual Generator',
      category: 'Visual AI',
      tagColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      title: 'High-resolution 4K 9:16 vertical render styled for Instagram algorithm',
      metric: 'Ultra HD',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#07080b] text-zinc-900 dark:text-white selection:bg-[#fb2175] selection:text-white transition-colors overflow-x-hidden font-sans">
      {/* 
        Header Navigation: 
        Centered navigation links between Logo (Left) and Actions (Right)
        Yellow-marked simulation bar and dots completely removed.
      */}
      <header className="sticky top-0 z-40 bg-[#fafafa]/90 dark:bg-[#07080b]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: Brand Logo using Instagram sampled colors */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ffcc02] via-[#ff2837] via-[#fb2175] to-[#a021b8] flex items-center justify-center text-white shadow-md">
              <InstagramIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
              SocialCraft <span className="text-[#fb2175] dark:text-[#ff3388]">AI</span>
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <a
              href="#features"
              className="hover:text-[#fb2175] dark:hover:text-pink-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#ai-studio"
              className="hover:text-[#fb2175] dark:hover:text-pink-400 transition-colors"
            >
              AI Studio
            </a>
            <a
              href="#meta-publisher"
              className="hover:text-[#fb2175] dark:hover:text-pink-400 transition-colors"
            >
              Meta Publisher
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#fb2175] dark:hover:text-pink-400 transition-colors"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="hover:text-[#fb2175] dark:hover:text-pink-400 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Log in Button */}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:border-[#fb2175] hover:text-[#fb2175] px-4 py-2 rounded-xl transition-all cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs"
            >
              Log in
            </button>

            {/* Start Free Button (Pink button as requested) */}
            <button
              onClick={() => navigate('/studio')}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#fb2175] hover:bg-[#e01464] text-white shadow-md hover:shadow-pink-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Start free
            </button>
          </div>
        </div>
      </header>

      {/* 
        Hero Section (Matches Image 1 layout & copy)
        Right side uses the First Image (media_1793892269091_6fd97054.jpg) containing
        the creator cards: "Selfie time, stay happy.", "Reel", and "Weekend drop".
      */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Create, approve and publish on-brand social content
            </h1>

            {/* Paragraph Description */}
            <p className="text-base text-zinc-600 dark:text-zinc-300 font-normal max-w-xl leading-relaxed">
              Turn a prompt or an image into captions, hashtags and visuals, edit them in a live preview, and publish to Instagram and Facebook.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/studio')}
                className="px-6 py-3.5 rounded-xl bg-[#fb2175] hover:bg-[#e01464] text-white font-bold text-xs shadow-lg hover:shadow-pink-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Start free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:text-[#fb2175] dark:hover:text-pink-400 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch demo</span>
              </button>
            </div>

            {/* Microcopy below buttons */}
            <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
              Transparent usage limits · No credit card
            </p>
          </div>

          {/* 
            Right Column: Hero Visual - Using the First Image (Creator Cards with Photos)
            Directly fulfills user instruction: "use the first image instead of second image"
          */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-pink-500/15 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* High-Resolution Creator Cards Asset */}
            <div className="relative w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-2 sm:p-2.5">
              <img
                src="/assets/hero-cards.jpg"
                alt="SocialCraft AI Creator Cards - Selfie time, stay happy, Reel, Weekend drop"
                className="w-full h-auto object-cover rounded-[26px] shadow-sm select-none"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* 
          Image 1 Bottom Feature Cards
          AI Content Studio | Brand Kit | Approve & schedule
        */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* Card 1: AI Content Studio */}
          <div
            onClick={() => navigate('/studio')}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-purple-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              AI Content Studio
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Captions, hashtags and images from a prompt.
            </p>
          </div>

          {/* Card 2: Brand Kit */}
          <div
            onClick={() => navigate('/brand-kit')}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-purple-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              Brand Kit
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Logo, colours and tone in every post.
            </p>
          </div>

          {/* Card 3: Approve & schedule */}
          <div
            onClick={() => navigate('/publisher')}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-purple-400/50 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              Approve & schedule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Review first, then post now or later.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Auto-Scroller Ticker Section (Infinite Marquee)
        Showcases live SocialCraft AI creation workflows
        Smooth continuous horizontal scroll, pauses on hover
        ========================================================================
      */}
      <section className="w-full py-10 bg-zinc-100/70 dark:bg-zinc-950/60 border-y border-zinc-200/80 dark:border-white/10 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Live SocialCraft Production Engine Feed
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
            Scroll paused on hover
          </span>
        </div>

        {/* Outer scrolling container with gradient fade edges */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafafa] dark:from-[#07080b] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafafa] dark:from-[#07080b] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex gap-5 py-2">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div
                key={idx}
                className="shrink-0 w-[340px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/10 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all hover:border-purple-400/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">
                    Channel: {item.category}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Use in studio <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section 1: AI Content & Reel Studio (Custom tailored for SocialCraft AI)
        Replaces external sample with our actual product capabilities:
        - AI Viral Hook & Script generation
        - Brand Kit logo & color integration
        - Trending Instagram Audio matching
        - 9:16 vertical Reel & Story live simulator
        ========================================================================
      */}
      <section id="ai-studio" className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-200/80 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: SocialCraft AI Studio Capabilities */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-700 dark:text-purple-300 w-fit">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>AI Content Studio · Powered by AI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-zinc-950 dark:text-white leading-[1.18]">
              Turn any prompt into high-retention Instagram Reels and Carousels
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              <p>
                Describe your product, paste a rough script, or upload reference media. SocialCraft AI synthesizes algorithm-tuned hooks, captions, and visuals designed to capture and hold viewers' attention.
              </p>

              <p>
                Instantly{' '}
                <span className="underline decoration-purple-400 dark:decoration-purple-500 underline-offset-4 font-semibold text-zinc-900 dark:text-white">
                  apply your official Brand Kit
                </span>{' '}
                with automatic logo stamping, exact HEX color grading, and your customized tone of voice across every generated asset.
              </p>

              <p>
                Pair your posts with{' '}
                <span className="underline decoration-purple-400 dark:decoration-purple-500 underline-offset-4 font-semibold text-zinc-900 dark:text-white">
                  trending Instagram audio tracks
                </span>{' '}
                analyzed in real time to multiply reach and position your Reels directly on the Instagram Explore page.
              </p>

              <p>
                Generate multi-slide carousel copy, hashtag clusters with verified search volume, and high-converting calls-to-action in under 2 seconds.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => navigate('/studio')}
                className="px-6 py-3.5 rounded-xl bg-[#fb2175] hover:bg-[#e01464] text-white font-bold text-xs shadow-md hover:shadow-pink-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch AI Studio Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>See Studio Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive SocialCraft 9:16 Creator Studio Workstation */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="w-full max-w-[500px] bg-zinc-950 rounded-[36px] p-6 sm:p-7 shadow-2xl border border-zinc-800 relative overflow-hidden">
              {/* Studio Prompt Header */}
              <div className="mb-4 bg-zinc-900/90 rounded-2xl p-3 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white shrink-0">
                    <PenTool className="w-3 h-3" />
                  </div>
                  <span className="text-zinc-300 truncate font-mono text-[11px]">
                    "Matte finish skincare launch with bold hook"
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold font-mono shrink-0 pl-2">
                  Generated in 1.4s
                </span>
              </div>

              {/* 9:16 Reel Player with Studio Dock */}
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {/* 9:16 Reel Preview Frame */}
                <div className="relative w-[240px] sm:w-[260px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10 group">
                  {/* High Quality On-Brand Lifestyle / Skincare Creator Visual */}
                  <img
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                    alt="SocialCraft AI Generated Instagram Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                  {/* Top Bar inside Reel */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          alt="brand avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-white text-[11px] font-bold tracking-tight">
                        @glowcraft.co
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                      Reel
                    </span>
                  </div>

                  {/* On-Screen Viral Hook Overlay (Auto-generated by AI) */}
                  <div className="absolute top-1/3 left-4 right-4 z-10 text-center">
                    <div className="inline-block bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 shadow-xl">
                      <p className="text-xs font-black text-white leading-snug">
                        3 mistakes ruining your daily skin barrier
                      </p>
                    </div>
                  </div>

                  {/* Right Side Engagement Dock */}
                  <div className="absolute bottom-14 right-3 z-10 flex flex-col items-center gap-3.5 text-white drop-shadow-md">
                    <div className="flex flex-col items-center">
                      <Heart className="w-5 h-5 fill-white text-white" />
                      <span className="text-[9px] font-bold mt-0.5">3.8k</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                      <span className="text-[9px] font-bold mt-0.5">241</span>
                    </div>

                    <div>
                      <Share2 className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <Bookmark className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Bottom Creator Audio Tag & Caption */}
                  <div className="absolute bottom-3 left-3 right-14 z-10 text-white text-left">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-200">
                      <Music className="w-3 h-3 text-pink-400 animate-spin" />
                      <span className="truncate">Trending: Aesthetic Waves · 142k</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 line-clamp-1 mt-1 font-mono">
                      #skincareroutine #glowup #glowcraft
                    </p>
                  </div>
                </div>

                {/* Vertical SocialCraft Studio Tool Dock */}
                <div className="flex flex-col items-center gap-2 py-4 px-2.5 rounded-full bg-white text-zinc-800 shadow-xl border border-zinc-200">
                  {/* 1. Prompt */}
                  <button
                    onClick={() => setActiveStudioTab('prompt')}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:bg-zinc-100 transition-colors cursor-pointer group"
                    title="Prompt"
                  >
                    <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:text-purple-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-700">Prompt</span>
                  </button>

                  {/* 2. Captions (Active) */}
                  <button
                    onClick={() => setActiveStudioTab('captions')}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-purple-50 border border-purple-200 shadow-xs cursor-pointer group"
                    title="Captions"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                      <Type className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black text-purple-900">Captions</span>
                  </button>

                  {/* 3. Brand Kit */}
                  <button
                    onClick={() => setActiveStudioTab('brand')}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:bg-zinc-100 transition-colors cursor-pointer group"
                    title="Brand Kit"
                  >
                    <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:text-purple-600">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-700">Brand</span>
                  </button>

                  {/* 4. Audio Recommendation */}
                  <button
                    onClick={() => setActiveStudioTab('audio')}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:bg-zinc-100 transition-colors cursor-pointer group"
                    title="Audio"
                  >
                    <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:text-purple-600">
                      <Music className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-700">Audio</span>
                  </button>

                  {/* 5. Aspect Ratio */}
                  <button
                    onClick={() => setActiveStudioTab('aspect')}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-2xl hover:bg-zinc-100 transition-colors cursor-pointer group"
                    title="Aspect Ratio"
                  >
                    <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:text-purple-600">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-700">9:16</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section 2: Direct Meta Graph API Publisher & Peak-Hour Scheduler
        (Custom tailored for SocialCraft AI - replaces VEED timeline)
        - Direct 1-click publishing via official Meta Graph API v21.0
        - Live Instagram feed preview simulator
        - Smart peak-audience scheduling calendar
        - Multi-account management
        ========================================================================
      */}
      <section id="meta-publisher" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Direct Publishing Features */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            {/* Social Proof & Partner Badge */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ffcc02] via-[#ff2837] via-[#fb2175] to-[#a021b8] flex items-center justify-center text-white shadow-md">
                <InstagramIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                  Official Meta Tech Provider
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  Verified Meta Graph API v21.0
                </span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-black tracking-tight text-zinc-950 dark:text-white leading-[1.14]">
              Direct 1-click Instagram publishing and peak-time scheduling
            </h2>

            {/* Benefit Copy */}
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              <p>
                No mobile push reminder gymnastics or manual copy-pasting. SocialCraft AI publishes directly to your connected Instagram Business or Creator account.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-white font-bold">Peak-Engagement Algorithm:</strong> Analyzes your audience's active hours to automatically schedule posts when follower activity is at its highest.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-white font-bold">Multi-Channel Syndication:</strong> Push to Instagram Feed, Instagram Reels, and Facebook Pages simultaneously from one centralized console.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/publisher')}
                className="px-7 py-4 rounded-full bg-[#fb2175] hover:bg-[#e01464] text-white font-black text-sm shadow-lg hover:shadow-pink-500/25 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <span>Launch Publisher Free</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                No credit card required
              </span>
            </div>
          </div>

          {/* Right Column: SocialCraft Publisher Workstation Mockup */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              {/* Account Connection Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        @socialcraft.brand
                      </span>
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Instagram Business Account · Meta Graph v21
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Account Connected</span>
                </div>
              </div>

              {/* Publisher Main Workstation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
                {/* Left Mini-Preview: Live Feed Card */}
                <div className="md:col-span-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                          S
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          socialcraft.brand
                        </span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                    </div>

                    {/* Post Image Preview */}
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 relative">
                      <img
                        src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                        alt="scheduled post preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                        Brand Kit: Applied
                      </div>
                    </div>

                    {/* Post Engagement Bar */}
                    <div className="flex items-center justify-between pt-2.5 text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4" />
                        <MessageCircle className="w-4 h-4" />
                        <Send className="w-4 h-4" />
                      </div>
                      <Bookmark className="w-4 h-4" />
                    </div>

                    {/* Caption Preview */}
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 pt-2 line-clamp-2 leading-relaxed">
                      <span className="font-bold text-zinc-900 dark:text-white mr-1">
                        socialcraft.brand
                      </span>
                      Meet the new standard for social creators. Tap the link in bio to explore the 2026 collection.
                    </p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-1">
                      #branding #creator #launch #socialcraft
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Aspect Ratio: 1:1 Square</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Validated for Meta API
                    </span>
                  </div>
                </div>

                {/* Right Controls: Destinations, Scheduling & Direct Publish */}
                <div className="md:col-span-6 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    {/* Publishing Channels */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                        Target Channels
                      </label>
                      <div className="space-y-2">
                        <div
                          onClick={() =>
                            setPublisherTarget((prev) => ({ ...prev, igFeed: !prev.igFeed }))
                          }
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            publisherTarget.igFeed
                              ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30'
                              : 'border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <InstagramIcon className="w-4 h-4 text-[#fb2175]" />
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                              Instagram Feed
                            </span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center ${
                              publisherTarget.igFeed
                                ? 'bg-[#fb2175] text-white'
                                : 'border border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            {publisherTarget.igFeed && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </div>

                        <div
                          onClick={() =>
                            setPublisherTarget((prev) => ({ ...prev, igReel: !prev.igReel }))
                          }
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            publisherTarget.igReel
                              ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30'
                              : 'border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-[#fb2175]" />
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                              Instagram Reels
                            </span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center ${
                              publisherTarget.igReel
                                ? 'bg-[#fb2175] text-white'
                                : 'border border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            {publisherTarget.igReel && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Timing Slot */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                        Calculated Peak Window
                      </label>
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span>Today at 6:30 PM</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                            84% Active
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          Highest engagement window for your followers
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Button */}
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/publisher')}
                      className="w-full py-3.5 rounded-xl bg-[#fb2175] hover:bg-[#e01464] text-white font-bold text-xs shadow-md hover:shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Schedule & Publish to Instagram</span>
                    </button>

                    <p className="text-[10px] text-zinc-400 text-center font-medium">
                      Direct publishing via Meta Graph API v21.0 · Zero reminders
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section: How It Works (#how-it-works)
        Explains how to use the application in clear, simple English in 4 steps.
        ========================================================================
      */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-200/80 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-700 dark:text-purple-300">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Simple 4-Step Process</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-zinc-950 dark:text-white leading-[1.14]">
            How to use SocialCraft AI in 4 simple steps
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            No design experience or complicated software required. Go from a quick thought to a published Instagram post or Reel in under 60 seconds.
          </p>
        </div>

        {/* 4 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-pink-400/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#fb2175] dark:text-pink-400 bg-pink-50 dark:bg-pink-950/80 px-2.5 py-1 rounded-lg border border-pink-200/60 dark:border-pink-800/60">
                  Step 01
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Setup
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-[#fb2175] dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Palette className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                Set up your brand style
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Add your business name, choose your brand colors, and upload your logo (optional). Connect your Instagram account securely in one click.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50 -mx-6 -mb-6 p-4 rounded-b-3xl text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="font-bold text-[#fb2175] dark:text-pink-400 block mb-0.5">Example:</span>
              Your logo and brand colors are saved once and automatically applied to every post.
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-pink-400/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#fb2175] dark:text-pink-400 bg-pink-50 dark:bg-pink-950/80 px-2.5 py-1 rounded-lg border border-pink-200/60 dark:border-pink-800/60">
                  Step 02
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Prompt
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-[#fb2175] dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                Type what you want to post
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Write a simple sentence describing your product, sale, or topic. You can also upload a photo or short video clip from your phone.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50 -mx-6 -mb-6 p-4 rounded-b-3xl text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="font-bold text-[#fb2175] dark:text-pink-400 block mb-0.5">Example:</span>
              "Announce a 20% off weekend sale for our handmade candles with a warm autumn theme."
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-pink-400/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#fb2175] dark:text-pink-400 bg-pink-50 dark:bg-pink-950/80 px-2.5 py-1 rounded-lg border border-pink-200/60 dark:border-pink-800/60">
                  Step 03
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  AI Magic
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-[#fb2175] dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                AI generates your full post
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                In just 2 seconds, the AI writes a catchy caption, adds viral hashtags, creates high-resolution images, and even pairs trending songs for Reels.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50 -mx-6 -mb-6 p-4 rounded-b-3xl text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="font-bold text-[#fb2175] dark:text-pink-400 block mb-0.5">Example:</span>
              You get 3 caption tone options (Friendly, Professional, or Energetic) ready to use.
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-pink-400/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#fb2175] dark:text-pink-400 bg-pink-50 dark:bg-pink-950/80 px-2.5 py-1 rounded-lg border border-pink-200/60 dark:border-pink-800/60">
                  Step 04
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Publish
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-[#fb2175] dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                Preview and publish with 1 click
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Check how your post looks on a realistic Instagram phone screen. Click "Publish Now" or pick a scheduled time to automatically post later.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50 -mx-6 -mb-6 p-4 rounded-b-3xl text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="font-bold text-[#fb2175] dark:text-pink-400 block mb-0.5">Example:</span>
              Posts directly to your Instagram Feed or Reels. No manual copy-pasting required.
            </div>
          </div>
        </div>

        {/* Action Banner below steps */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-pink-500/30">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-black">
              Ready to create your first Instagram post?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300">
              Try SocialCraft AI today. It takes less than a minute to generate your first on-brand post.
            </p>
          </div>

          <button
            onClick={() => navigate('/studio')}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-[#fb2175] hover:bg-[#e01464] text-white font-bold text-xs shadow-md hover:shadow-pink-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Start Creating Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 
        ========================================================================
        Section: Frequently Asked Questions (#faq)
        Plain-English sample questions and clear answers for everyday users.
        ========================================================================
      */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-zinc-200/80 dark:border-white/10">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-700 dark:text-purple-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Questions Answered</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-zinc-950 dark:text-white leading-[1.14]">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            Everything you need to know about SocialCraft AI in simple, everyday language.
          </p>
        </div>

        {/* Interactive Accordion List */}
        <div className="space-y-4">
          {[
            {
              q: "Do I need design skills or marketing experience to use this app?",
              a: "No, you do not need any experience at all! SocialCraft AI is built for everyone—creators, small business owners, and beginners. You simply write what your post is about in everyday English. Our AI creates the visual design, writes the caption, and adds the best hashtags automatically.",
              tag: "Beginner Friendly",
            },
            {
              q: "Does this app post directly to my Instagram account?",
              a: "Yes! When you connect your Instagram account, SocialCraft AI publishes directly to your Instagram Feed or Reels through official Meta Graph APIs. You do not need to download images or copy-paste text on your phone.",
              tag: "Direct Publishing",
            },
            {
              q: "Can I schedule posts to go live automatically later?",
              a: "Yes. You can choose any future date and time you want your post to go live. You can also turn on 'Auto Peak-Time', and the system will automatically schedule your post for when most of your followers are online and active.",
              tag: "Smart Scheduling",
            },
            {
              q: "Can I edit the generated caption, image, or hashtags before posting?",
              a: "Yes, you have 100% control. You can edit any sentence in the caption, add or remove hashtags, upload your own photo, change brand colors, or ask the AI to rewrite with a single click before you publish.",
              tag: "Full Control",
            },
            {
              q: "Is my Instagram account safe and secure?",
              a: "Yes, 100% safe. We connect using official Meta Graph APIs approved by Meta (Instagram and Facebook). We never ask for, see, or store your personal Instagram password.",
              tag: "Safety & Privacy",
            },
            {
              q: "Can I use my own company logo and brand colors?",
              a: "Yes! In your Brand Kit, you can upload your business logo, choose your brand colors, and set your brand voice. Every post you create will automatically include your logo and brand style so your feed looks professional.",
              tag: "Brand Kit",
            },
            {
              q: "Can I post to both Instagram and Facebook at the same time?",
              a: "Yes! You can connect your Facebook Page alongside your Instagram account. With one click, your post or reel will be published to both platforms simultaneously, saving you double the time.",
              tag: "Cross-Platform",
            },
            {
              q: "How does the trending music and audio feature work?",
              a: "For Reels and video posts, SocialCraft AI scans which audio tracks are currently popular on Instagram. It suggests matching sounds so your video has a higher chance of reaching more people on the Instagram Explore page.",
              tag: "Reels & Music",
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all shadow-2xs hover:border-pink-400/50"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#fb2175] shrink-0" />
                    <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                      {faq.q}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-pink-100 text-[#fb2175] dark:bg-pink-950 dark:text-pink-300' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-white/5 pt-4 space-y-3 animate-in fade-in duration-200">
                    <p>{faq.a}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-[10px] font-bold text-[#fb2175] dark:text-pink-300">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>{faq.tag}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 
        Interactive Watch Demo Modal 
      */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Commercial Platform Walkthrough</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                How SocialCraft AI Works
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Watch how creators go from an idea or raw footage to scheduled Instagram Reels, Carousels, and high-retention captions in under 60 seconds with AI and official Meta APIs.
              </p>

              <div className="aspect-video w-full rounded-2xl bg-zinc-900 relative overflow-hidden border border-white/10 flex items-center justify-center">
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-full ig-gradient text-white mx-auto flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Live Commercial Creator Studio Preview Active
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setIsDemoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    navigate('/studio');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#fb2175] hover:bg-[#e01464] text-white text-xs font-bold shadow hover:shadow-pink-500/25 cursor-pointer"
                >
                  Start Using Free
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        Commercial-Grade Multi-Column Footer
        ========================================================================
      */}
      <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-white/10 pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top Grid: Brand & Categorized Link Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-zinc-200/80 dark:border-white/10">
            {/* Column 1: Brand Info (span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-4 text-left">
              {/* Instagram Logo + Name using sampled Instagram gradient colors */}
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ffcc02] via-[#ff2837] via-[#fb2175] to-[#a021b8] flex items-center justify-center text-white shadow-md">
                  <InstagramIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                  SocialCraft <span className="text-[#fb2175] dark:text-[#ff3388]">AI</span>
                </span>
              </div>

              {/* Tagline & Mission */}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                The commercial-grade AI video and social publishing engine engineered for high-retention Instagram and Facebook growth. Create viral reels, multi-slide carousels, and studio-grade videos in seconds.
              </p>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Meta Graph API v21.0 Connected · Systems Operational</span>
              </div>
            </div>

            {/* Column 2: Uses (span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Uses & Solutions
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <li>
                  <a href="#ai-studio" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    E-Commerce Brands
                  </a>
                </li>
                <li>
                  <a href="#ai-studio" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Content Creators
                  </a>
                </li>
                <li>
                  <a href="#meta-publisher" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Digital Agencies
                  </a>
                </li>
                <li>
                  <a href="#meta-publisher" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Product Launches
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Short-Form Reels
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Viral Carousel Posts
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Pages (span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Platform Pages
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <li>
                  <span
                    onClick={() => navigate('/')}
                    className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Home
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate('/studio')}
                    className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    AI Studio
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Content Studio
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate('/brand-kit')}
                    className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Brand Kit
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate('/publisher')}
                    className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Publish & Schedule
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => navigate('/accounts')}
                    className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Meta Accounts
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Capabilities (span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Capabilities
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <li>
                  <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    AI Hooks
                  </span>
                </li>
                <li>
                  <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    Brand Kit Theming
                  </span>
                </li>
                <li>
                  <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    Trending Audio Sync
                  </span>
                </li>
                <li>
                  <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    Hashtag Research
                  </span>
                </li>
                <li>
                  <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    Live Feed Simulator
                  </span>
                </li>
                <li>
                  <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    Official Graph API
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 5: Sign In & Access (span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Sign In & Access
              </h4>
              <div className="space-y-2 text-xs font-medium">
                <button
                  onClick={() => navigate('/auth/login')}
                  className="w-full text-left px-3 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-[#fb2175] dark:text-pink-300 font-bold hover:brightness-105 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Sign In to App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/studio')}
                  className="w-full text-left px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-purple-400 transition-all cursor-pointer"
                >
                  Create Free Account
                </button>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full text-left px-3 py-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>1-Click Live Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p className="text-center sm:text-left">
              © 2026 SocialCraft AI Inc. All rights reserved. Built for high-growth Instagram and Facebook creators with official Meta Graph APIs.
            </p>

            <div className="flex items-center gap-6 font-medium">
              <a href="#privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Security & Meta Partner
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
