export type SocialPlatform = 'instagram' | 'facebook';

export type PostType = 'reel' | 'carousel' | 'image' | 'story';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export type CreationMode = 'text' | 'image' | 'video' | 'reference';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  brandName?: string;
  instagramHandle?: string;
  facebookPageName?: string;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  accountType: 'instagram_business' | 'instagram_creator' | 'facebook_page';
  accountName: string;
  username: string;
  avatarUrl: string;
  followersCount: number;
  isConnected: boolean;
  tokenExpiresAt: string;
  permissions: string[];
  pageId?: string;
  instagramId?: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  duration: number; // in seconds
  title: string;
  visualPrompt: string;
  spokenAudio: string;
  onScreenText: string;
  textPosition: 'top' | 'center' | 'bottom';
  transition: 'fade' | 'slide' | 'zoom' | 'cut' | 'whip_pan';
  imageUrl?: string;
  videoUrl?: string;
}

export interface ContentScript {
  id: string;
  topic: string;
  targetAudience: string;
  tone: string;
  hook: string;
  body: string;
  callToAction: string;
  caption: string;
  hashtags: string[];
  scenes: ScriptScene[];
  estimatedDuration: number;
  recommendedAudio?: string;
}

export interface GeneratedPost {
  id: string;
  title: string;
  postType: PostType;
  creationMode: CreationMode;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  thumbnailUrl: string;
  platforms: SocialPlatform[];
  status: PostStatus;
  scheduledTime?: string;
  publishedTime?: string;
  scenes?: ScriptScene[];
  createdAt: string;
  updatedAt: string;
  metaPostId?: string;
  instagramPermalink?: string;
  recommendedSong?: {
    title: string;
    artist: string;
    vibe: string;
    audioUrl?: string;
  };
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
  };
}

export interface BrandKit {
  brandName: string;
  handle: string;
  tagline: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  toneOfVoice: string;
  targetAudience: string;
  defaultHashtags: string[];
  defaultCta: string;
}

export interface ReferenceReelAnalysis {
  hookType: string;
  hookDuration: number;
  pacing: 'Fast (1-2s cuts)' | 'Medium (2-4s cuts)' | 'Slow & Cinematic';
  visualStyle: string;
  textOverlayStyle: string;
  transitionTypes: string[];
  audioVibe: string;
  keyEngagementDriver: string;
  sceneCount: number;
}

