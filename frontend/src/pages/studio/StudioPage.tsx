import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { InstagramPhoneMockup } from '@/components/ui/InstagramPhoneMockup';
import type { CreationMode, GeneratedPost, ScriptScene, ReferenceReelAnalysis } from '@/types';
import {
  Type,
  Image as ImageIcon,
  Video,
  Workflow,
  Cpu,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Sliders,
  Scissors,
  Send,
} from 'lucide-react';

export const StudioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addPost, setActiveDraft, addToast, brandKit } = useApp();

  const initialMode = (searchParams.get('mode') as CreationMode) || 'text';
  const [activeMode, setActiveMode] = useState<CreationMode>(initialMode);

  useEffect(() => {
    const modeParam = searchParams.get('mode') as CreationMode;
    if (modeParam && ['text', 'image', 'video', 'reference'].includes(modeParam)) {
      setActiveMode(modeParam);
    }
  }, [searchParams]);

  const handleModeChange = (mode: CreationMode) => {
    setActiveMode(mode);
    setSearchParams({ mode });
  };

  // State for Mode A (Text to Content)
  const [topic, setTopic] = useState('5 Secret AI Habits to Scale Instagram Reach');
  const [tone, setTone] = useState('Inspirational & Professional');
  const [targetAudience, setTargetAudience] = useState('Founders, Creators, & Digital Agencies');
  const [postTypeChoice, setPostTypeChoice] = useState<'reel' | 'carousel'>('reel');
  const [photoMatches, setPhotoMatches] = useState<Array<{ id: string; thumbnailUrl: string; creator: string; license: string }>>([]);
  const [isFindingPhotos, setIsFindingPhotos] = useState(false);

  // State for Mode B (Image to Content)
  const [uploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  ]);
  const [imageAnalysis] = useState<string>(
    'Detected: Modern tech workspace with studio contrast. Theme: Productivity & High-Performance Creators.'
  );

  // State for Mode C (Video to Content)
  const [videoPacing, setVideoPacing] = useState('Fast (1.8s cuts)');
  const [subtitleStyle, setSubtitleStyle] = useState('Bold Instagram Clean White');

  // State for Mode D (Reference Reel to New Reel)
  const [referenceUrl, setReferenceUrl] = useState('https://instagram.com/reel/C8kLm90Pqz');
  const [customNichePrompt, setCustomNichePrompt] = useState('Adapt the viral 3-step breakdown pacing for an AI Social Media SaaS product');
  const [referenceAnalysis] = useState<ReferenceReelAnalysis>({
    hookType: 'Problem statement in first 0.8s',
    hookDuration: 1.5,
    pacing: 'Fast (1-2s cuts)',
    visualStyle: 'High-contrast studio lighting with dynamic zooms',
    textOverlayStyle: 'Bold centered uppercase with gradient highlight',
    transitionTypes: ['Whip pan', 'Zoom in', 'Cut on action'],
    audioVibe: 'Trending electronic lofi with voice ducking',
    keyEngagementDriver: 'Pinned comment prompt keyword',
    sceneCount: 3,
  });

  // Generated Output Preview State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [generatedPost, setGeneratedPost] = useState<Partial<GeneratedPost>>({
    title: '5 Secret AI Habits to Scale Instagram Reach',
    postType: 'reel',
    creationMode: 'text',
    caption: `Still spending hours crafting reels?\n\nHere are 5 high-leverage AI workflows top creators use to double output.\n\nSave this for your next session.`,
    hashtags: ['#InstagramGrowth', '#CreatorHacks', '#AITools', '#ReelsViral', '#ContentStrategy'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    ],
    scenes: [
      {
        id: 'sc-1',
        sceneNumber: 1,
        duration: 3,
        title: 'Hook',
        visualPrompt: 'Futuristic glowing glass laptop with ambient Instagram lighting',
        spokenAudio: 'Stop spending hours on reels when AI can script and edit them in 60 seconds.',
        onScreenText: 'STOP SPENDING HOURS ON REELS',
        textPosition: 'center',
        transition: 'zoom',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'sc-2',
        sceneNumber: 2,
        duration: 4,
        title: 'Workflow Breakdown',
        visualPrompt: 'Screencast of SocialCraft AI converting thoughts into full 9:16 reels',
        spokenAudio: 'The studio writes every scene, then stitches the transitions.',
        onScreenText: 'GEMINI AI + AUTOMATED EDITING',
        textPosition: 'top',
        transition: 'slide',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'sc-3',
        sceneNumber: 3,
        duration: 3,
        title: 'Call to Action',
        visualPrompt: 'Phone mockup showing Instagram direct messages receiving automated prompt kit',
        spokenAudio: 'Reply AUTOMATE and I will send you the complete prompt vault for free.',
        onScreenText: 'REPLY AUTOMATE FOR ACCESS',
        textPosition: 'bottom',
        transition: 'fade',
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      },
    ],
    analytics: {
      likes: 4210,
      comments: 295,
      shares: 1140,
      saves: 1820,
      reach: 56000,
      impressions: 72000,
    },
  });

  useEffect(() => {
    if (!isGenerating) return;
    setGenProgress(4);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setGenProgress(Math.min(92, Math.round(6 + (1 - Math.exp(-elapsed / 16000)) * 86)));
    }, 300);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    addToast(`Creating ${activeMode} content from your description...`, 'info');

    let newTitle = topic;
    let newScenes: ScriptScene[] = [];
    let newCaption = '';
    let newPostType = postTypeChoice;
    let newThumb = '';
    let newMedia: string[] = [];

    if (activeMode === 'text') {
      try {
        const token = localStorage.getItem('ig_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            prompt: topic.trim(),
            postType: postTypeChoice,
            slidesCount: 3,
            brandName: brandKit.brandName || 'Aura Studio',
            instagramHandle: brandKit.handle || '@aurastudio.ai',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.result) {
          throw new Error(data.error || 'Could not create that post.');
        }
        if (data.success && data.result) {
          const r = data.result;
          newTitle = r.title || topic;
          newCaption = r.caption;
          newPostType = r.postType;

          if (r.slides && r.slides.length > 0) {
            newMedia = r.slides.map((s: any) => s.imageUrl);
            newThumb = r.slides[0].imageUrl;
            newScenes = r.slides.map((s: any, idx: number) => ({
              id: `sc-ai-${idx + 1}`,
              sceneNumber: idx + 1,
              duration: 3,
              title: s.title,
              visualPrompt: `Cloud Diffusion 1080x1350 - ${s.title}`,
              spokenAudio: s.subtitle,
              onScreenText: s.title.toUpperCase(),
              textPosition: (idx % 3 === 0 ? 'center' : idx % 3 === 1 ? 'top' : 'bottom') as any,
              transition: (idx === 0 ? 'zoom' : idx === 1 ? 'slide' : 'fade') as any,
              imageUrl: s.imageUrl,
            }));
          } else if (r.images && r.images.length > 0) {
            newThumb = r.images[0];
            newMedia = r.images;
          }
        }
      } catch (err: any) {
        setIsGenerating(false);
        addToast(err.message || 'Could not create that post.', 'error');
        return;
      }
    } else if (activeMode === 'image') {
      newTitle = 'Visual Storytelling Carousel: ' + uploadedImages.length + ' Slides';
      newPostType = 'carousel';
      newCaption = `Swipe through for the full breakdown.\n\nEvery slide is structured for maximum swipe-through rate. Which slide was your favorite?`;
    } else if (activeMode === 'video') {
      newTitle = 'Auto-Cut Short Reel from Video Upload';
      newPostType = 'reel';
      newCaption = `Clean cuts. High energy. Zero filler.\n\nAutomated with SocialCraft AI video scene detection.`;
    } else if (activeMode === 'reference') {
      newTitle = 'Original Viral Structure Reel: ' + customNichePrompt;
      newPostType = 'reel';
      newCaption = `We reverse-engineered a viral reference structure and created this 100% original version tailored for our brand.`;
    }

    setGeneratedPost((prev) => ({
      ...prev,
      title: newTitle,
      postType: newPostType,
      caption: newCaption || prev?.caption,
      thumbnailUrl: newThumb || prev?.thumbnailUrl,
      mediaUrls: newMedia.length > 0 ? newMedia : prev?.mediaUrls,
      scenes: newScenes.length > 0 ? newScenes : prev?.scenes,
    }));

    setGenProgress(100);
    setIsGenerating(false);
    addToast('AI Generation Complete.', 'success');
  };

  const handleFindPhotos = async () => {
    if (!topic.trim()) {
      addToast('Enter a description first.', 'warning');
      return;
    }
    setIsFindingPhotos(true);
    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/ai/photos/search', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ prompt: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'No licensed photos matched.');
      setPhotoMatches(data.images || []);
      if (!data.images?.length) addToast('No licensed photos matched that description.', 'warning');
    } catch (error: any) {
      addToast(error.message || 'Photo search failed.', 'error');
    } finally {
      setIsFindingPhotos(false);
    }
  };

  const handleUseMatchedPhoto = async (id: string) => {
    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/ai/photos/use', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.imageUrl) throw new Error(data.error || 'That photo cannot be used.');
      setGeneratedPost((prev) => ({
        ...prev,
        postType: 'image',
        thumbnailUrl: data.imageUrl,
        mediaUrls: [data.imageUrl],
        caption: prev?.caption ? `${prev.caption}\n\n${data.attribution}` : data.attribution,
      }));
      addToast('Photo added to the post.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Could not use that photo.', 'error');
    }
  };

  const handleUseOwnImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      if (!url) return;
      setGeneratedPost((prev) => ({
        ...prev,
        thumbnailUrl: url,
        mediaUrls: [url],
        postType: 'image',
        scenes: [
          {
            id: 'sc-upload-1',
            sceneNumber: 1,
            duration: 3,
            title: topic.trim().slice(0, 60) || 'Uploaded photo',
            visualPrompt: 'Uploaded photo',
            spokenAudio: topic.trim(),
            onScreenText: (topic.trim().slice(0, 40) || 'Uploaded photo').toUpperCase(),
            textPosition: 'center',
            transition: 'fade',
            imageUrl: url,
          },
        ],
      }));
      addToast('Your photo is now the post image.', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendToEditor = () => {
    const post = addPost({
      ...generatedPost,
      creationMode: activeMode,
      status: 'draft',
    });
    setActiveDraft(post);
    navigate('/editor');
  };

  const handleSendToPublisher = () => {
    const post = addPost({
      ...generatedPost,
      creationMode: activeMode,
      status: 'draft',
    });
    setActiveDraft(post);
    navigate('/publisher');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-xs">
        <button
          onClick={() => handleModeChange('text')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'text'
              ? 'ig-gradient text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Mode A: Text</span>
        </button>

        <button
          onClick={() => handleModeChange('image')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'image'
              ? 'ig-gradient text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Mode B: Carousel</span>
        </button>

        <button
          onClick={() => handleModeChange('video')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'video'
              ? 'ig-gradient text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Mode C: Video</span>
        </button>

        <button
          onClick={() => handleModeChange('reference')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeMode === 'reference'
              ? 'ig-gradient text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Mode D: Clone Reel</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-5">
            {/* Mode A */}
            {activeMode === 'text' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-rose-500" />
                    <span>Mode A: Text to Content</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Enter a topic. The studio writes scene hooks, voiceover lines, and captions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Topic or Question
                  </label>
                  <textarea
                    rows={2}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 5 AI workflows to scale content output"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Content Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                    >
                      <option>Inspirational & Professional</option>
                      <option>High Energy & Direct</option>
                      <option>Witty & Entertaining</option>
                      <option>Aesthetic & Minimalist</option>
                      <option>Educational Breakdown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Creators & Founders"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Format
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPostTypeChoice('reel')}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        postTypeChoice === 'reel'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>9:16 Vertical Reel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostTypeChoice('carousel')}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        postTypeChoice === 'carousel'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Carousel (1:1)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode B */}
            {activeMode === 'image' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    <span>Mode B: Image to Carousel</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Upload images to generate a narrative carousel with slide headlines.
                  </p>
                </div>

                <div className="border border-dashed border-zinc-300 dark:border-white/15 rounded-2xl p-5 text-center bg-zinc-50 dark:bg-zinc-900/40">
                  <UploadCloud className="w-7 h-7 text-purple-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-zinc-800 dark:text-white">Upload Images (1-10 Slides)</p>
                  <p className="text-[10px] text-zinc-400">PNG, JPG up to 20MB</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <p className="font-semibold text-purple-700 dark:text-purple-300 mb-0.5">Reference Analysis</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">{imageAnalysis}</p>
                </div>
              </div>
            )}

            {/* Mode C */}
            {activeMode === 'video' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-500" />
                    <span>Mode C: Video to Reel</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Extract highlight scenes and animated captions from raw footage.
                  </p>
                </div>

                <div className="border border-dashed border-zinc-300 dark:border-white/15 rounded-2xl p-5 text-center bg-zinc-50 dark:bg-zinc-900/40">
                  <Video className="w-7 h-7 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-zinc-800 dark:text-white">Footage Loaded (45s)</p>
                  <p className="text-[10px] text-zinc-400">Vertical 9:16 format detected</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Cut Pacing</label>
                    <select
                      value={videoPacing}
                      onChange={(e) => setVideoPacing(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    >
                      <option>Fast (1.8s cuts)</option>
                      <option>Medium (3.2s cuts)</option>
                      <option>Cinematic (5s cuts)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Subtitle Style</label>
                    <select
                      value={subtitleStyle}
                      onChange={(e) => setSubtitleStyle(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    >
                      <option>Bold Instagram Clean White</option>
                      <option>Minimalist Typewriter</option>
                      <option>Modern Shadow Overlay</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Mode D */}
            {activeMode === 'reference' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-cyan-500" />
                    <span>Mode D: Reference Clone</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Deconstructs viral pacing to create a copyright-safe original reel.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Reference Reel URL
                  </label>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Niche Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={customNichePrompt}
                    onChange={(e) => setCustomNichePrompt(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Hook Duration:</span>
                      <span className="font-semibold">{referenceAnalysis.hookDuration}s</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Pacing Rhythm:</span>
                      <span className="font-semibold">{referenceAnalysis.pacing}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating content {genProgress}%</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Generate Content Script</span>
                </>
              )}
            </button>
            <label className="w-full py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold text-xs border border-zinc-200 dark:border-white/10 flex items-center justify-center gap-2 cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Use a photo from this computer</span>
              <input type="file" accept="image/*" onChange={handleUseOwnImage} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleFindPhotos}
              disabled={isFindingPhotos}
              className="w-full py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold text-xs border border-zinc-200 dark:border-white/10 cursor-pointer disabled:opacity-50"
            >
              {isFindingPhotos ? 'Matching photos...' : 'Find licensed photos'}
            </button>
            {photoMatches.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photoMatches.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleUseMatchedPhoto(photo.id)}
                    className="rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 text-left cursor-pointer"
                  >
                    <img src={photo.thumbnailUrl} alt="" className="w-full aspect-square object-cover" />
                    <span className="block px-1.5 py-1 text-[10px] text-zinc-500 truncate">{photo.creator} · {photo.license.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scenes Breakdown */}
          {generatedPost.scenes && generatedPost.scenes.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Scene Breakdown ({generatedPost.scenes.length} Scenes)
                </h4>
                <button
                  onClick={handleSendToEditor}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in Editor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {generatedPost.scenes.map((scene, i) => (
                  <div
                    key={scene.id || i}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md ig-gradient text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {scene.sceneNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {scene.onScreenText}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {scene.spokenAudio}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 font-medium">
                      {scene.duration}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Phone Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Live Phone Mockup
            </span>
            <span className="text-[10px] text-rose-500 font-semibold">9:16 Vertical</span>
          </div>

          <InstagramPhoneMockup
            post={generatedPost}
            mode={generatedPost.postType === 'carousel' ? 'post' : 'reel'}
          />

          <div className="w-full grid grid-cols-2 gap-2 max-w-[340px]">
            <button
              onClick={handleSendToEditor}
              className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white font-semibold text-xs border border-zinc-200 dark:border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-rose-500" />
              <span>Video Editor</span>
            </button>
            <button
              onClick={handleSendToPublisher}
              className="py-2.5 px-3 rounded-xl ig-gradient text-white font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
