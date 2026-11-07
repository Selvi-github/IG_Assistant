import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BrandKit, ConnectedAccount, GeneratedPost } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export const initialBrandKit: BrandKit = {
  brandName: 'Aura Studio',
  handle: '@aurastudio.ai',
  tagline: 'AI-Powered Creative Social Media',
  description: 'A modern design and tech studio empowering creators with generative AI tools and visual storytelling.',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  primaryColor: '#dc2743',
  secondaryColor: '#bc1888',
  accentColor: '#f09433',
  fontHeading: 'Inter',
  fontBody: 'Plus Jakarta Sans',
  toneOfVoice: 'Inspirational, Concise and Professional',
  targetAudience: 'Digital creators, founders, agency owners, aesthetic lifestyle brands',
  defaultHashtags: [
    '#SocialCraftAI',
    '#ContentCreator',
    '#InstagramGrowth',
    '#AIContent',
    '#ReelsProduction',
    '#DigitalStrategy',
  ],
  defaultCta: 'Save this post for later. Share your perspective in the comments below.',
};

export const initialConnectedAccounts: ConnectedAccount[] = [
  {
    id: 'acc-ig-1',
    platform: 'instagram',
    accountType: 'instagram_business',
    accountName: 'Aura Studio Official',
    username: 'aurastudio.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    followersCount: 38400,
    isConnected: true,
    tokenExpiresAt: '2026-12-15T00:00:00.000Z',
    permissions: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_insights',
      'instagram_manage_comments',
    ],
    instagramId: '17841405309211029',
  },
  {
    id: 'acc-fb-1',
    platform: 'facebook',
    accountType: 'facebook_page',
    accountName: 'Aura Studio Page',
    username: 'aurastudiotech',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    followersCount: 14200,
    isConnected: true,
    tokenExpiresAt: '2026-12-15T00:00:00.000Z',
    permissions: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
    ],
    pageId: '109283746519201',
  },
];

export const initialPosts: GeneratedPost[] = [
  {
    id: 'post-1',
    title: '5 AI Tools Every Creator Needs in 2026',
    postType: 'reel',
    creationMode: 'text',
    caption: `Still spending hours editing social reels?\n\nHere are 5 structured AI workflows that save time and increase reach.\n\nSave this reel for your next batching session.`,
    hashtags: ['#AITools', '#ContentCreator', '#ProductivityHacks', '#InstagramReels', '#GrowthStrategy'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    platforms: ['instagram', 'facebook'],
    status: 'published',
    publishedTime: '2026-11-04T18:30:00.000Z',
    createdAt: '2026-11-04T17:10:00.000Z',
    updatedAt: '2026-11-04T18:30:00.000Z',
    metaPostId: 'ig_17938201948271',
    analytics: {
      likes: 3420,
      comments: 184,
      shares: 924,
      saves: 1450,
      reach: 48900,
      impressions: 62400,
    },
    scenes: [
      {
        id: 'sc-1',
        sceneNumber: 1,
        duration: 3,
        title: 'High-Impact Hook',
        visualPrompt: 'Futuristic glowing glass laptop with ambient Instagram lighting',
        spokenAudio: 'Stop wasting hours creating reels when AI can script and edit them in 60 seconds.',
        onScreenText: 'STOP SPENDING HOURS ON REELS',
        textPosition: 'center',
        transition: 'zoom',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'sc-2',
        sceneNumber: 2,
        duration: 4,
        title: 'The AI Workflow Breakdown',
        visualPrompt: 'Clean UI mockups showing automated scene timeline and video cuts',
        spokenAudio: 'Tool number one automates your video script directly into high-converting scenes.',
        onScreenText: 'TOOL 1: AI SCENE GENERATOR',
        textPosition: 'top',
        transition: 'slide',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'sc-3',
        sceneNumber: 3,
        duration: 3,
        title: 'Call to Action',
        visualPrompt: 'Phone screen with profile follow button and notification badge',
        spokenAudio: 'Comment AUTOMATE and I will send you the complete prompt vault for free.',
        onScreenText: 'REPLY AUTOMATE FOR ACCESS',
        textPosition: 'bottom',
        transition: 'fade',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'post-2',
    title: 'The 3-Step Psychology of High-Retention Carousels',
    postType: 'carousel',
    creationMode: 'image',
    caption: `Most carousels fail on slide 2.\n\nSwipe through to understand the exact visual pacing that keeps audience retention above 85%.\n\nSave this guide to audit your next post.`,
    hashtags: ['#CarouselDesign', '#InstagramTips', '#SocialMediaMarketing', '#VisualDesign', '#Storytelling'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    platforms: ['instagram'],
    status: 'scheduled',
    scheduledTime: '2026-11-06T19:00:00.000Z',
    createdAt: '2026-11-05T09:15:00.000Z',
    updatedAt: '2026-11-05T09:15:00.000Z',
  },
  {
    id: 'post-3',
    title: 'How We Built SocialCraft AI Architecture',
    postType: 'reel',
    creationMode: 'reference',
    caption: `From messy scripts to automated vertical reels in one click. Here is a look behind our architecture powered by the studio and Meta Graph API.`,
    hashtags: ['#BuildInPublic', '#FastAPI', '#ReactDeveloper', '#AIEngineering', '#TechStartup'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    platforms: ['instagram', 'facebook'],
    status: 'draft',
    createdAt: '2026-11-05T11:45:00.000Z',
    updatedAt: '2026-11-05T11:45:00.000Z',
  },
];
