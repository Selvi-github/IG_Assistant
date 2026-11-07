import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Send,
  Upload,
  Music2,
  Clock,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Cpu,
  ArrowRight,
  Image as ImageIcon,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X,
  Copy,
  Check,
  Edit2,
  Share2,
  MessageCircle,
  Play,
  Pause,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';
import { PostDesignEditor } from '@/mobile/components/PostDesignEditor';

interface CarouselSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  publicUrl?: string;
}

export interface CaptionOption {
  style: string;
  caption: string;
  hashtags: string[];
}

interface AudioTrack {
  title: string;
  artist: string;
  vibe: string;
  audioUrl?: string;
}

const SAMPLE_SONGS: AudioTrack[] = [
  { title: 'Golden Hour Waves', artist: 'Nova Horizon', vibe: 'Pop' },
  { title: 'Lofi Sunset Reverie', artist: 'Kaelen Beats', vibe: 'Lo-Fi' },
  { title: 'Midnight City Drive', artist: 'Aura Collective', vibe: 'Electronic' },
  { title: 'Morning Acoustic Bloom', artist: 'Daybreak Trio', vibe: 'Acoustic' },
];

interface PhotoMatch {
  id: string;
  title: string;
  thumbnailUrl: string;
  creator: string;
  license: string;
  provider: string;
  score: number;
}

export const MobileCreatePostPage: React.FC = () => {
  const { brandKit, addPost, updatePost, schedulePost, addToast, triggerConfetti } = useApp();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState<'image' | 'carousel'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [photoMatches, setPhotoMatches] = useState<PhotoMatch[]>([]);
  const [isFindingPhotos, setIsFindingPhotos] = useState(false);

  // Content state
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const currentPreviewImage =
    postType === 'carousel' && slides.length > 0
      ? slides[activeSlideIndex]?.imageUrl
      : generatedImage;

  // 3-Option Caption & RAG State
  const [captionOptions, setCaptionOptions] = useState<CaptionOption[]>([]);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegeneratingCaptions, setIsRegeneratingCaptions] = useState(false);

  // Audio and Schedule state
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(SAMPLE_SONGS);
  const [selectedSong, setSelectedSong] = useState<AudioTrack>(SAMPLE_SONGS[0]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showAudioList, setShowAudioList] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduleTime, setScheduleTime] = useState('18:30');

  // Native Sharing & Publishing state
  const [activeMediaFile, setActiveMediaFile] = useState<File | null>(null);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<
    'idle' | 'validating' | 'creating_container' | 'checking_status' | 'published' | 'error'
  >('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [livePermalink, setLivePermalink] = useState<string | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isGenerating) return;
    setGenProgress(4);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setGenProgress(Math.min(92, Math.round(6 + (1 - Math.exp(-elapsed / 16000)) * 86)));
    }, 300);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  React.useEffect(() => {
    let active = true;
    fetch('/api/ai/audio?q=trending%20english')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data.success || !Array.isArray(data.tracks) || data.tracks.length === 0) return;
        setAudioTracks(data.tracks);
        setSelectedSong((current) => current.audioUrl ? current : data.tracks[0]);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      audioRef.current?.pause();
    };
  }, []);

  const cleanHandle = (brandKit.handle || 'creator')
    .trim()
    .replace(/^[@.]+/, '')
    .replace(/\/+$/, '') || 'instagram';

  // Pre-cache media file as soon as image changes for zero-latency native sharing (YouTube style)
  React.useEffect(() => {
    if (!currentPreviewImage) {
      setActiveMediaFile(null);
      return;
    }

    let isSubscribed = true;
    (async () => {
      try {
        const res = await fetch(currentPreviewImage);
        const blob = await res.blob();
        if (isSubscribed) {
          const file = new File([blob], 'instagram_post.jpg', {
            type: blob.type || 'image/jpeg',
          });
          setActiveMediaFile(file);
        }
      } catch (err) {
        console.warn('Pre-cache media note:', err);
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [currentPreviewImage]);

  // Generate Real AI Images & Carousels using the proven, high-aesthetic algorithm
  const handleGenerateAI = async () => {
    if (!description.trim()) {
      addToast('Please enter what you want to post.', 'warning');
      return;
    }

    setIsGenerating(true);
    addToast(
      postType === 'carousel'
        ? 'Crafting 4-slide Instagram carousel visuals...'
        : 'Synthesizing 1080x1350 photorealistic post visual...',
      'info'
    );

    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          prompt: description.trim(),
          postType,
          slidesCount: 3,
          brandName: brandKit.brandName || 'Aura Studio',
          instagramHandle: brandKit.handle || '@creator',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || 'Failed to generate AI visual content.');
      }

      const { result } = data;
      setGeneratedTitle(result.title);

      if (Array.isArray(result.captionOptions) && result.captionOptions.length > 0) {
        setCaptionOptions(result.captionOptions);

        const defaultIdx = postType === 'carousel' ? 1 : 0;
        setSelectedCaptionIndex(defaultIdx);
        const chosen = result.captionOptions[defaultIdx] || result.captionOptions[0];
        setGeneratedCaption(`${chosen.caption}\n\n${chosen.hashtags.join(' ')}`);
      } else {
        setGeneratedCaption(result.caption);
      }

      if (postType === 'carousel' && Array.isArray(result.slides) && result.slides.length > 0) {
        setSlides(result.slides);
        setActiveSlideIndex(0);
        setGeneratedImage(result.slides[0].imageUrl);
      } else if (Array.isArray(result.images) && result.images.length > 0) {
        setGeneratedImage(result.images[0]);
        setSlides([]);
      }

      if (result.recommendedSong) {
        const track = result.recommendedSong as AudioTrack;
        setSelectedSong(track);
        if (track.audioUrl) {
          setAudioTracks((prev) => [track, ...prev.filter((item) => item.audioUrl !== track.audioUrl)].slice(0, 12));
        }
      }
      setGenProgress(100);

      setHasGenerated(true);
      addToast(
        postType === 'carousel'
          ? '4-Slide Instagram Carousel generated successfully!'
          : 'Photorealistic Instagram post crafted successfully!',
        'success'
      );
    } catch (error: any) {
      console.error('AI Generation error:', error);
      addToast(error.message || 'Error communicating with AI service.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate 3 concept-specific captions on demand via RAG engine
  const handleRegenerateCaptions = async () => {
    const textPrompt = description.trim() || generatedTitle || 'Creative Instagram post';
    if (!textPrompt) {
      addToast('Please enter what you want to post first.', 'warning');
      return;
    }

    setIsRegeneratingCaptions(true);
    addToast('Analyzing visual concept with RAG NLP engine...', 'info');

    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          prompt: textPrompt,
          brandName: brandKit.brandName || '',
          brandBio: brandKit.description || brandKit.tagline || '',
          tone: 'creative',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.captions)) {
        throw new Error(data.error || 'Failed to generate captions.');
      }

      setCaptionOptions(data.captions);

      const activeIdx = Math.min(selectedCaptionIndex, data.captions.length - 1);
      const chosen = data.captions[activeIdx] || data.captions[0];
      if (chosen) {
        const fullText = `${chosen.caption}\n\n${chosen.hashtags.join(' ')}`;
        setGeneratedCaption(fullText);
      }

      addToast('3 new concept-accurate captions generated!', 'success');
    } catch (err: any) {
      console.error('Caption generation error:', err);
      addToast(err.message || 'Error generating captions.', 'error');
    } finally {
      setIsRegeneratingCaptions(false);
    }
  };

  const handleFindPhotos = async () => {
    if (!description.trim()) {
      addToast('Enter a description first.', 'warning');
      return;
    }
    setIsFindingPhotos(true);
    addToast('Searching licensed photos and matching them to your text.', 'info');
    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/ai/photos/search', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ prompt: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.images)) {
        throw new Error(data.error || 'No licensed photos matched that description.');
      }
      setPhotoMatches(data.images);
      if (data.images.length === 0) {
        addToast('No licensed photos matched that description.', 'warning');
      }
      void handleRegenerateCaptions();
    } catch (error: any) {
      addToast(error.message || 'Photo search failed.', 'error');
    } finally {
      setIsFindingPhotos(false);
    }
  };

  const handleUseMatchedPhoto = async (photo: PhotoMatch) => {
    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/ai/photos/use', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: photo.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.imageUrl) {
        throw new Error(data.error || 'That photo cannot be used.');
      }
      setGeneratedImage(data.imageUrl);
      setSlides([]);
      setPostType('image');
      setHasGenerated(true);
      addToast(data.attribution || 'Photo added to the post.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Could not use that photo.', 'error');
    }
  };

  // Select one of the 3 caption styles
  const handleSelectCaption = (index: number) => {
    setSelectedCaptionIndex(index);
    const chosen = captionOptions[index];
    if (chosen) {
      const fullText = `${chosen.caption}\n\n${chosen.hashtags.join(' ')}`;
      setGeneratedCaption(fullText);
    }
  };

  // Copy active caption and hashtags to clipboard
  const handleCopyActiveCaption = () => {
    const textToCopy = generatedCaption || description;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    addToast('Caption copied to clipboard.', 'success');
  };

  // Custom user photo upload fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const uploadedUrl = event.target.result as string;
          if (postType === 'carousel' && slides.length > 0) {
            const updated = [...slides];
            updated[activeSlideIndex] = {
              ...updated[activeSlideIndex],
              imageUrl: uploadedUrl,
            };
            setSlides(updated);
          } else {
            setGeneratedImage(uploadedUrl);
          }
          addToast('Custom image applied to post.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsAudioPlaying(false);
  };

  const playTrack = async (track: AudioTrack) => {
    if (!track.audioUrl) {
      addToast('Choose a track from the list to play it.', 'warning');
      setShowAudioList(true);
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const player = audioRef.current;
    if (player.src !== track.audioUrl) {
      player.src = track.audioUrl;
      player.onended = () => setIsAudioPlaying(false);
    }
    setSelectedSong(track);
    try {
      await player.play();
      setIsAudioPlaying(true);
    } catch {
      setIsAudioPlaying(false);
      addToast('This audio file could not be played. Choose another track.', 'error');
    }
  };

  const handleRegenerateSong = async () => {
    stopAudio();
    const query = description.trim() || 'instrumental';
    try {
      const res = await fetch(`/api/ai/audio?q=${encodeURIComponent(query)}&page=${Math.ceil(Math.random() * 3)}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        setAudioTracks(data.tracks);
        setSelectedSong(data.tracks[0]);
        setShowAudioList(true);
        addToast('New audio choices are ready. Press play to preview.', 'success');
        return;
      }
    } catch {
      // Keep the current list.
    }
    const nextIndex = (audioTracks.indexOf(selectedSong) + 1) % audioTracks.length;
    setSelectedSong(audioTracks[nextIndex] || audioTracks[0]);
    setShowAudioList(true);
  };


  // Schedule Post Action
  const handleSchedulePost = () => {
    const activeImageUrl =
      postType === 'carousel' && slides.length > 0
        ? slides[0].imageUrl
        : generatedImage;

    const mediaList =
      postType === 'carousel' && slides.length > 0
        ? slides.map((s) => s.imageUrl)
        : [activeImageUrl];

    const post = addPost({
      title: generatedTitle || description.slice(0, 45) || 'Daily Instagram Post',
      caption: generatedCaption || description,
      thumbnailUrl: activeImageUrl,
      mediaUrls: mediaList,
      postType: postType === 'carousel' ? 'carousel' : 'image',
      creationMode: 'text',
      platforms: ['instagram'],
      recommendedSong: selectedSong,
      status: 'scheduled',
    });

    const today = new Date().toISOString().split('T')[0];
    const scheduledIso = new Date(`${today}T${scheduleTime}`).toISOString();
    schedulePost(post.id, scheduledIso);
    addToast(`Post scheduled for ${scheduleTime} today.`, 'success');
    navigate('/dashboard');
  };

  // Helper to persist post into SQLite database
  const savePostToDatabase = (status: 'published' | 'draft' = 'published') => {
    const activeImageUrl =
      postType === 'carousel' && slides.length > 0
        ? slides[0].imageUrl
        : generatedImage;

    const fullCaption = generatedCaption || description;
    const mediaList =
      postType === 'carousel' && slides.length > 0
        ? slides.map((s) => s.imageUrl)
        : [activeImageUrl];

    let postId = currentPostId;
    if (!postId) {
      const created = addPost({
        title: generatedTitle || description.slice(0, 45) || 'Instagram Post',
        caption: fullCaption,
        thumbnailUrl: activeImageUrl,
        mediaUrls: mediaList,
        postType: postType === 'carousel' ? 'carousel' : 'image',
        creationMode: 'text',
        platforms: ['instagram'],
        recommendedSong: selectedSong,
        status,
      });
      postId = created.id;
      setCurrentPostId(postId);
    } else {
      updatePost(postId, {
        status,
        caption: fullCaption,
        thumbnailUrl: activeImageUrl,
        mediaUrls: mediaList,
      });
    }

  };

  // Primary Action: Open Device Native Sharing Sheet (YouTube style)
  const handlePublishOrShare = async () => {
    if (!currentPreviewImage && !description.trim()) {
      addToast('Please generate or upload a post visual first.', 'warning');
      return;
    }

    if (scheduleMode === 'schedule') {
      handleSchedulePost();
      return;
    }

    const songLine = selectedSong?.title
      ? `\n\nSong: ${selectedSong.title} — ${selectedSong.artist}`
      : '';
    const fullCaption = `${generatedCaption || description}${songLine}`.trim();

    // 1. Ensure file is ready
    let fileToShare = activeMediaFile;
    if (!fileToShare && currentPreviewImage) {
      try {
        const res = await fetch(currentPreviewImage);
        const blob = await res.blob();
        fileToShare = new File([blob], 'instagram_post.jpg', {
          type: blob.type || 'image/jpeg',
        });
        setActiveMediaFile(fileToShare);
      } catch (e) {
        console.warn('Fetch media file error:', e);
      }
    }

    savePostToDatabase('published');
    setPublishStep('published');
    triggerConfetti();

    try {
      await navigator.clipboard.writeText(fullCaption);
    } catch {
      // Instagram still receives the image.
    }

    // Auto-download media so the photo is ready in the user's phone / computer gallery
    if (fileToShare) {
      downloadMedia(fileToShare);
    }

    // Redirect to Instagram post creation page
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://camera';
      setTimeout(() => {
        window.open(`https://www.instagram.com/${cleanHandle}/`, '_blank');
      }, 1400);
    } else {
      window.open('https://www.instagram.com/', '_blank');
    }

    addToast('Caption copied & image saved! Opening Instagram to publish your post...', 'success');
  };

  const sharePackageText = () => {
    const caption = (generatedCaption || description).trim();
    const audioLine = selectedSong?.title
      ? `\n\nAudio: ${selectedSong.title} by ${selectedSong.artist}`
      : '';
    return `${caption}${audioLine}`.trim();
  };

  const ensureMediaFile = async (): Promise<File | null> => {
    if (activeMediaFile) return activeMediaFile;
    if (!currentPreviewImage) return null;
    try {
      const res = await fetch(currentPreviewImage);
      const blob = await res.blob();
      const file = new File([blob], 'instagram_post.jpg', { type: blob.type || 'image/jpeg' });
      setActiveMediaFile(file);
      return file;
    } catch {
      return null;
    }
  };

  const downloadMedia = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name || 'instagram-post.jpg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const openShareTarget = (target: 'post' | 'reel' | 'chat' | 'whatsapp' | 'status', text: string) => {
    const encoded = encodeURIComponent(text);
    const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (target === 'whatsapp' || target === 'status') {
      window.location.href = mobile
        ? `whatsapp://send?text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;
      return;
    }
    if (target === 'chat') {
      window.location.href = mobile ? 'instagram://direct-inbox' : 'https://www.instagram.com/direct/inbox/';
      return;
    }
    if (target === 'reel') {
      window.location.href = mobile
        ? 'instagram://reels_camera'
        : `https://www.instagram.com/${cleanHandle}/reels/`;
      return;
    }
    window.location.href = mobile
      ? `instagram://user?username=${encodeURIComponent(cleanHandle)}`
      : `https://www.instagram.com/${cleanHandle}/`;
  };

  const deliverShare = async (target: 'post' | 'reel' | 'chat' | 'whatsapp' | 'status') => {
    const text = sharePackageText();
    const title = generatedTitle || 'Instagram post';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Sharing still sends the text when the browser allows it.
    }

    const file = await ensureMediaFile();
    const payload: ShareData = { title, text };
    if (file && navigator.canShare?.({ files: [file] })) {
      payload.files = [file];
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload);
        setIsShareDrawerOpen(false);
        setPublishStep('published');
        triggerConfetti();
        addToast('Image, caption, and hashtags were handed to the app. Paste the caption if its box is empty.', 'success');
        return;
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
      }
    }

    if (file) downloadMedia(file);
    openShareTarget(target, text);
    setIsShareDrawerOpen(false);
    addToast('Caption copied and image downloaded. Attach the image in the screen that opened, then paste the caption.', 'info');
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Success View */}
      {publishStep === 'published' ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Post Ready & Shared!
            </h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Media handed over to your device share sheet with caption and hashtags.
            </p>
          </div>

          <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm max-w-[260px] mx-auto bg-zinc-100 dark:bg-zinc-900">
            {currentPreviewImage && (
              <img
                src={currentPreviewImage}
                alt="Published post"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Media & caption passed to device share</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Caption & hashtags copied to clipboard</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Post saved to recent posts</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handlePublishOrShare}
              className="w-full py-3.5 px-4 rounded-xl ig-gradient text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Again via Device Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const fullCaption = generatedCaption || description;
                navigator.clipboard.writeText(fullCaption);
                addToast('Caption & hashtags copied to clipboard!', 'success');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Caption & Hashtags</span>
            </button>

            <button
              onClick={() => {
                setPublishStep('idle');
                setDescription('');
                setGeneratedCaption('');
                setSlides([]);
                setGeneratedImage('');
                setCurrentPostId(null);
                navigate('/dashboard');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Done & Return to Feed
            </button>
          </div>
        </div>
      ) : (
        /* Create Post Form */
        <div className="space-y-4">
          {/* 1. Input & Format Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3 shadow-xs">
            {/* Header with Clean Format Toggle */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Create Post
              </span>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPostType('image')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    postType === 'image'
                      ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Single Image
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('carousel')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    postType === 'carousel'
                      ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Carousel
                </button>
              </div>
            </div>

            {/* Description Textarea */}
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to post (e.g. Girl and boy in separate cards, same pose, cafe-themed background...)"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-3.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-rose-500 leading-relaxed transition-colors font-sans"
            />

            {/* Primary Action Button */}
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-2xl ig-gradient text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating post {genProgress}%</span>
                </>
              ) : (
                <span>{hasGenerated ? 'Regenerate Post' : 'Generate Post'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDesigner((open) => !open)}
              className="w-full py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-xs font-semibold cursor-pointer"
            >
              {showDesigner ? 'Hide design tools' : 'Design it yourself'}
            </button>
            <label className="w-full py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Use a photo from this computer</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {showDesigner && (
            <PostDesignEditor
              backgroundImage={currentPreviewImage || undefined}
              onApply={(dataUrl) => {
                setGeneratedImage(dataUrl);
                setSlides([]);
                setPostType('image');
                setHasGenerated(true);
                setShowDesigner(false);
              }}
            />
          )}

          {/* 2. Visual Preview */}
          {(currentPreviewImage || isGenerating) && (
            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {postType === 'carousel' ? 'Carousel Visuals' : 'Generated Image'}
                </span>

                <label className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center p-6 space-y-3 w-full">
                    <p className="text-3xl font-black text-rose-500 tabular-nums">{genProgress}%</p>
                    <div className="w-44 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mx-auto">
                      <div className="h-full ig-gradient transition-all duration-300" style={{ width: `${genProgress}%` }} />
                    </div>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {genProgress < 35 ? 'Writing a caption for your description' : genProgress < 75 ? 'Creating the image' : 'Finishing the post'}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      1080x1350 · Photorealistic
                    </p>
                  </div>
                ) : (
                  <>
                    <img
                      src={currentPreviewImage}
                      alt="AI Post Visual"
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {postType === 'carousel' && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-rose-400" />
                        <span>
                          Slide {activeSlideIndex + 1} of {slides.length}
                        </span>
                      </div>
                    )}

                    {postType === 'carousel' && slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlideIndex((prev) =>
                              prev > 0 ? prev - 1 : slides.length - 1
                            )
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                          title="Previous Slide"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlideIndex((prev) =>
                              prev < slides.length - 1 ? prev + 1 : 0
                            )
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                          title="Next Slide"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Carousel Thumbnails */}
              {postType === 'carousel' && slides.length > 1 && !isGenerating && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeSlideIndex === idx
                          ? 'border-rose-500 scale-102 shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={s.imageUrl}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Caption & Hashtags Card */}
          {(generatedCaption || description) && (
            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Caption & Hashtags
                </span>

                <button
                  type="button"
                  onClick={handleCopyActiveCaption}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Style selector pills: Catchy, Aesthetic, Engaging */}
              {captionOptions.length > 0 && (
                <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                  {captionOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCaption(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate text-center ${
                        selectedCaptionIndex === idx
                          ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      {opt.style.replace('Option ', '').replace(' & ', ' ')}
                    </button>
                  ))}
                </div>
              )}

              {/* Direct editable textarea */}
              <textarea
                rows={5}
                value={generatedCaption || description}
                onChange={(e) => setGeneratedCaption(e.target.value)}
                placeholder="Caption will appear here..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
            </div>
          )}

          {/* Recommended Audio */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => (isAudioPlaying ? stopAudio() : playTrack(selectedSong))}
                  className="w-10 h-10 rounded-2xl ig-gradient flex items-center justify-center text-white shrink-0 shadow-xs cursor-pointer"
                  title={isAudioPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {selectedSong.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-semibold shrink-0">
                      {selectedSong.vibe}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {selectedSong.artist} · {isAudioPlaying ? 'Playing' : 'Tap to play'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRegenerateSong}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5 transition-colors cursor-pointer"
                title="Change Audio"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {showAudioList && (
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {audioTracks.map((track, index) => (
                  <button
                    key={`${track.audioUrl || track.title}-${index}`}
                    type="button"
                    onClick={() => playTrack(track)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                      selectedSong.audioUrl === track.audioUrl && selectedSong.title === track.title
                        ? 'border-rose-500 bg-rose-500/10 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <span className="font-semibold block truncate">{track.title}</span>
                    <span className="text-[10px] text-zinc-500">{track.artist} · {track.vibe}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Publishing Action */}
          <div className="pt-2 pb-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-zinc-500">Ready to share?</span>
              <button
                type="button"
                onClick={() => setScheduleMode(scheduleMode === 'now' ? 'schedule' : 'now')}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{scheduleMode === 'schedule' ? 'Publish Immediately' : 'Schedule for Later'}</span>
              </button>
            </div>

            {scheduleMode === 'schedule' && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Select Delivery Time Today
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <button
              onClick={handlePublishOrShare}
              disabled={isGenerating || (!currentPreviewImage && !description.trim())}
              className="w-full py-3.5 px-4 rounded-2xl ig-gradient text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>
                {scheduleMode === 'now'
                  ? 'Publish to Instagram'
                  : `Schedule for ${scheduleTime}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-zinc-500 text-center px-2">
              Instagram receives the image only. The caption is copied — click Add a caption and paste.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
