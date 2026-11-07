import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BrandKit, ConnectedAccount, GeneratedPost } from '@/types';
import { initialBrandKit, initialConnectedAccounts, initialPosts } from '@/lib/utils';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  brandKit: BrandKit;
  updateBrandKit: (updates: Partial<BrandKit>) => void;
  hasBrandProfile: boolean;
  isLoadingBrand: boolean;
  saveBrandProfile: (details: {
    companyName: string;
    instagramHandle: string;
    bio?: string;
    targetAudience?: string;
    logoUrl?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  connectedAccounts: ConnectedAccount[];
  connectAccount: (platform: 'instagram' | 'facebook', details: Partial<ConnectedAccount>) => void;
  disconnectAccount: (accountId: string) => void;
  posts: GeneratedPost[];
  addPost: (postData: Partial<GeneratedPost>) => GeneratedPost;
  updatePost: (id: string, updates: Partial<GeneratedPost>) => void;
  deletePost: (id: string) => void;
  publishPostNow: (
    id: string,
    options?: { imageUrl?: string; caption?: string; hashtags?: string }
  ) => Promise<{ success: boolean; permalink?: string; error?: string }>;
  schedulePost: (id: string, scheduledIso: string) => void;
  activeDraft: Partial<GeneratedPost> | null;
  setActiveDraft: (draft: Partial<GeneratedPost> | null) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKit>(() => {
    const saved = localStorage.getItem('socialcraft_brand_kit');
    return saved ? JSON.parse(saved) : initialBrandKit;
  });

  const [hasBrandProfile, setHasBrandProfile] = useState<boolean>(() => {
    return localStorage.getItem('ig_assistant_onboarded') === 'true';
  });
  const [isLoadingBrand, setIsLoadingBrand] = useState<boolean>(true);

  // Connected Accounts State
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    const saved = localStorage.getItem('socialcraft_accounts');
    return saved ? JSON.parse(saved) : initialConnectedAccounts;
  });

  // Posts State (Defaults to empty for authenticated users, demo posts only in demo mode)
  const [posts, setPosts] = useState<GeneratedPost[]>(() => {
    if (sessionStorage.getItem('ig_demo_active') === 'true') {
      return initialPosts;
    }
    const saved = localStorage.getItem('socialcraft_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Active Draft in Studio / Editor
  const [activeDraft, setActiveDraft] = useState<Partial<GeneratedPost> | null>(() => {
    return posts[0] || null;
  });

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize brand & posts with backend whenever authentication changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoadingBrand(false);
        return;
      }

      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        // 1. Fetch user's brand profile from SQLite
        const brandRes = await fetch('/api/brand', {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (brandRes.ok) {
          const brandData = await brandRes.json();
          if (brandData.success && brandData.hasBrand && brandData.brand) {
            setBrandKit((prev) => ({
              ...prev,
              brandName: brandData.brand.company_name,
              handle: brandData.brand.instagram_handle,
              description: brandData.brand.bio || '',
              targetAudience: brandData.brand.target_audience || 'Followers & Customers',
              logoUrl: brandData.brand.logo_url || '',
              primaryColor: brandData.brand.primary_color || '#fb2175',
            }));
            setHasBrandProfile(true);
            localStorage.setItem('ig_assistant_onboarded', 'true');
          } else {
            // New user without brand profile yet
            setBrandKit((prev) => ({
              ...prev,
              brandName: user.brandName || user.fullName || '',
              handle: user.instagramHandle || '',
              logoUrl: user.avatarUrl || '',
            }));
            setHasBrandProfile(false);
            localStorage.removeItem('ig_assistant_onboarded');
          }
        }

        // 2. Fetch user's posts from SQLite
        const postsRes = await fetch('/api/posts', {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          if (postsData.success && Array.isArray(postsData.posts)) {
            const formatted = postsData.posts.map((p: any) => ({
              id: p.id,
              title: p.title,
              postType: p.post_type,
              caption: p.caption,
              hashtags: p.hashtags ? p.hashtags.split(',') : [],
              thumbnailUrl: p.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
              mediaUrls: p.media_urls ? [p.media_urls] : [],
              status: p.status,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            }));
            setPosts(formatted);
          }
        }
      } catch (err) {
        console.warn('Backend brand/posts sync error:', err);
      } finally {
        setIsLoadingBrand(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    try {
      const safeBrand =
        brandKit.logoUrl && brandKit.logoUrl.length > 50000
          ? { ...brandKit, logoUrl: '' }
          : brandKit;
      localStorage.setItem('socialcraft_brand_kit', JSON.stringify(safeBrand));
    } catch (err) {
      console.warn('LocalStorage brandKit sync skipped due to browser quota:', err);
    }
  }, [brandKit]);

  useEffect(() => {
    try {
      localStorage.setItem('socialcraft_accounts', JSON.stringify(connectedAccounts));
    } catch (err) {
      console.warn('LocalStorage accounts sync skipped:', err);
    }
  }, [connectedAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('socialcraft_posts', JSON.stringify(posts));
    } catch (err) {
      console.warn('LocalStorage posts sync skipped:', err);
    }
  }, [posts]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888'],
      });
    } catch {
      // ignore
    }
  };

  const updateBrandKit = (updates: Partial<BrandKit>) => {
    setBrandKit((prev) => ({ ...prev, ...updates }));
    addToast('Brand Kit updated successfully!', 'success');
  };

  // Save Brand Profile to Backend Datatable
  const saveBrandProfile = async (details: {
    companyName: string;
    instagramHandle: string;
    bio?: string;
    targetAudience?: string;
    logoUrl?: string | null;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('ig_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/brand', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(details),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to save brand details.' };
      }

      const b = data.brand;
      setBrandKit((prev) => ({
        ...prev,
        brandName: b.company_name,
        handle: b.instagram_handle,
        description: b.bio || '',
        targetAudience: b.target_audience || 'Followers & Customers',
        logoUrl: b.logo_url || '',
        primaryColor: b.primary_color || '#fb2175',
      }));

      setHasBrandProfile(true);
      localStorage.setItem('ig_assistant_onboarded', 'true');
      addToast('Brand profile successfully saved in database!', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving brand.' };
    }
  };

  const connectAccount = (platform: 'instagram' | 'facebook', details: Partial<ConnectedAccount>) => {
    setConnectedAccounts((prev) => {
      const existing = prev.find((a) => a.platform === platform);
      if (existing) {
        return prev.map((a) =>
          a.id === existing.id
            ? { ...a, ...details, isConnected: true, tokenExpiresAt: new Date(Date.now() + 60 * 86400000).toISOString() }
            : a
        );
      }
      const newAcc: ConnectedAccount = {
        id: `acc-${platform}-${Date.now()}`,
        platform,
        accountType: platform === 'instagram' ? 'instagram_business' : 'facebook_page',
        accountName: details.accountName || (platform === 'instagram' ? 'My Instagram' : 'My Page'),
        username: details.username || (platform === 'instagram' ? 'instagram_creator' : 'facebook_page'),
        avatarUrl: details.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        followersCount: details.followersCount || 12500,
        isConnected: true,
        tokenExpiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
        permissions:
          platform === 'instagram'
            ? ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights']
            : ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
        ...details,
      };
      return [...prev, newAcc];
    });
    addToast(`Connected to Meta Graph API for ${platform === 'instagram' ? 'Instagram' : 'Facebook'}!`, 'success');
  };

  const disconnectAccount = (accountId: string) => {
    setConnectedAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, isConnected: false } : a))
    );
    addToast('Account disconnected from SocialCraft AI', 'info');
  };

  const addPost = (postData: Partial<GeneratedPost>): GeneratedPost => {
    const now = new Date().toISOString();
    const newPost: GeneratedPost = {
      id: `post-${Date.now()}`,
      title: postData.title || 'Untitled Creation',
      postType: postData.postType || 'reel',
      creationMode: postData.creationMode || 'text',
      caption: postData.caption || '',
      hashtags: postData.hashtags || brandKit.defaultHashtags,
      mediaUrls: postData.mediaUrls || [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      ],
      thumbnailUrl:
        postData.thumbnailUrl ||
        postData.mediaUrls?.[0] ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      platforms: postData.platforms || ['instagram'],
      status: postData.status || 'draft',
      scenes: postData.scenes || [],
      createdAt: now,
      updatedAt: now,
      ...postData,
    };

    setPosts((prev) => [newPost, ...prev]);
    setActiveDraft(newPost);

    // Save asynchronously to backend
    const token = localStorage.getItem('ig_token');
    if (token) {
      fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newPost.title,
          caption: newPost.caption,
          hashtags: newPost.hashtags?.join(','),
          postType: newPost.postType,
          status: newPost.status,
          thumbnailUrl: newPost.thumbnailUrl,
          mediaUrls: Array.isArray(newPost.mediaUrls) ? newPost.mediaUrls.join(',') : newPost.mediaUrls,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.post?.id) {
            setPosts((current) =>
              current.map((p) => (p.id === newPost.id ? { ...p, id: data.post.id } : p))
            );
          }
        })
        .catch((err) => console.warn('Post save API error:', err));
    }

    addToast('New social media post drafted!', 'success');
    return newPost;
  };

  const updatePost = (id: string, updates: Partial<GeneratedPost>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    if (activeDraft && activeDraft.id === id) {
      setActiveDraft((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    const token = localStorage.getItem('ig_token');
    if (token) {
      fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      }).catch((err) => console.warn('Delete post API error:', err));
    }
    addToast('Post removed', 'info');
  };

  const publishPostNow = async (
    id: string,
    options?: { imageUrl?: string; caption?: string; hashtags?: string }
  ): Promise<{ success: boolean; permalink?: string; error?: string }> => {
    const target = posts.find((p) => p.id === id);
    if (!target && !options?.imageUrl) {
      return { success: false, error: 'Post not found in studio session.' };
    }

    const token = localStorage.getItem('ig_token');
    const mediaToPublish = options?.imageUrl || target?.thumbnailUrl || target?.mediaUrls?.[0];
    const captionToPublish = options?.caption || target?.caption || '';
    const hashtagsToPublish = options?.hashtags || target?.hashtags?.join(' ') || '';

    if (!token) {
      return { success: false, error: 'Sign in before publishing this post.' };
    }

    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          postId: id,
          imageUrl: mediaToPublish,
          caption: captionToPublish,
          hashtags: hashtagsToPublish,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Instagram did not accept this post.');
      }

      const publishedPermalink = data.permalink as string | undefined;
      updatePost(id, {
        status: 'published',
        publishedTime: data.publishedAt || new Date().toISOString(),
        metaPostId: data.instagramMediaId,
        instagramPermalink: publishedPermalink,
      });
      triggerConfetti();
      addToast('Published to the connected Instagram account.', 'success');
      return { success: true, permalink: publishedPermalink };
    } catch (err: any) {
      console.error('[Publish Error]', err);
      addToast(err.message || 'Instagram publishing failed.', 'error');
      return { success: false, error: err.message || 'Instagram publishing failed.' };
    }
  };

  const schedulePost = (id: string, scheduledIso: string) => {
    updatePost(id, {
      status: 'scheduled',
      scheduledTime: scheduledIso,
    });

    const token = localStorage.getItem('ig_token');
    if (token) {
      fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'scheduled',
          scheduledFor: scheduledIso,
        }),
      }).catch((err) => console.warn('Post patch error:', err));
    }

    addToast(
      `Scheduled for ${new Date(scheduledIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      'success'
    );
  };

  return (
    <AppContext.Provider
      value={{
        brandKit,
        updateBrandKit,
        hasBrandProfile,
        isLoadingBrand,
        saveBrandProfile,
        connectedAccounts,
        connectAccount,
        disconnectAccount,
        posts,
        addPost,
        updatePost,
        deletePost,
        publishPostNow,
        schedulePost,
        activeDraft,
        setActiveDraft,
        toasts,
        addToast,
        removeToast,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
