import { ConnectedAccountModel, ConnectedAccountRecord } from '../models/connectedAccountModel.js';
import { PostModel, PostRecord } from '../models/postModel.js';
import { BrandModel } from '../models/brandModel.js';

export interface PublishStepProgress {
  step: 'validating' | 'creating_container' | 'checking_status' | 'publishing' | 'completed' | 'failed';
  message: string;
  containerId?: string;
  mediaId?: string;
  permalink?: string;
  error?: string;
}

export interface PublishResult {
  success: boolean;
  message: string;
  instagramMediaId?: string;
  permalink?: string;
  publishedAt?: string;
  error?: string;
  accountUsed?: {
    username: string;
    accountName: string;
    businessId: string;
  };
}

export const InstagramPublishService = {
  /**
   * Validate if the user has an active connected Instagram professional account.
   */
  async getConnectedInstagramAccount(userId: string): Promise<ConnectedAccountRecord | null> {
    let account = ConnectedAccountModel.getInstagramAccount(userId);

    // If no explicit DB record exists, check user's brand profile and env configuration
    if (!account) {
      const brand = BrandModel.getByUserId(userId);
      const handle = brand?.instagram_handle || '@creator';
      const cleanHandle = handle.replace('@', '');

      // Check if global META access token is provided in .env
      const envToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || null;
      const envBusinessId = process.env.INSTAGRAM_BUSINESS_ID || process.env.META_IG_USER_ID || null;

      account = ConnectedAccountModel.upsertAccount(userId, {
        platform: 'instagram',
        accountType: 'instagram_business',
        instagramBusinessId: envBusinessId,
        username: cleanHandle,
        accountName: brand?.company_name || 'My Instagram Studio',
        avatarUrl: brand?.logo_url || null,
        accessToken: envToken,
        followersCount: 1250,
      });
    }

    return account;
  },

  /**
   * Ensures the media URL is a public HTTPS URL accessible by Meta's crawler.
   */
  resolvePublicMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) return '';

    // If already a public https URL
    if (mediaUrl.startsWith('https://') && !mediaUrl.includes('localhost') && !mediaUrl.includes('127.0.0.1')) {
      return mediaUrl;
    }

    // If running in development with a local URL, check if PUBLIC_BASE_URL is set in .env
    const publicBase = process.env.PUBLIC_BASE_URL || process.env.APP_URL;
    if (publicBase && mediaUrl.startsWith('/')) {
      return `${publicBase.replace(/\/$/, '')}${mediaUrl}`;
    }

    return mediaUrl;
  },

  /**
   * Publishes an image post to Instagram via official Meta Graph API v21.0.
   *
   * Exact Sequence:
   * 1. Validate connected account & permissions
   * 2. POST /{ig-user-id}/media -> creates media container
   * 3. GET /{container-id}?fields=status_code,status -> check processing status
   * 4. POST /{ig-user-id}/media_publish -> publish container to feed
   * 5. GET /{media-id}?fields=permalink -> retrieve real post link
   * 6. Save instagram_media_id and permalink to database
   */
  async publishImagePost(params: {
    userId: string;
    postId: string;
    imageUrl: string;
    caption: string;
    hashtags?: string;
  }): Promise<PublishResult> {
    const { userId, postId, imageUrl, caption, hashtags } = params;

    const fullCaption = hashtags && !caption.includes(hashtags)
      ? `${caption.trim()}\n\n${hashtags.trim()}`
      : caption.trim();

    let post = PostModel.getPostById(postId, userId);
    if (!post) {
      // Auto-create post record if called before async frontend persistence
      post = PostModel.createPost(userId, {
        title: caption.slice(0, 45) || 'Instagram Post',
        caption: fullCaption,
        hashtags: hashtags || undefined,
        thumbnailUrl: imageUrl,
        mediaUrls: imageUrl,
        postType: 'image',
        status: 'draft',
      });
    }

    const account = await this.getConnectedInstagramAccount(userId);
    if (!account) {
      throw new Error('No connected Instagram account found. Please connect your account first.');
    }

    const publicMediaUrl = this.resolvePublicMediaUrl(imageUrl);
    const hasLiveMetaToken = Boolean(account.access_token && account.instagram_business_id);

    console.log(`[Meta Graph API] Initiating publishing for post ${postId} to Instagram account @${account.username}`);
    console.log(`[Meta Graph API] Media URL: ${publicMediaUrl}`);

    // If live Meta token and Business Account ID are configured:
    if (hasLiveMetaToken) {
      const accessToken = account.access_token!;
      const igBusinessId = account.instagram_business_id!;

      try {
        // Step 1: Create Media Container
        console.log(`[Meta Graph API] Step 1: Creating container on IG Account ${igBusinessId}...`);
        const containerRes = await fetch(
          `https://graph.facebook.com/v21.0/${igBusinessId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: publicMediaUrl,
              caption: fullCaption,
              access_token: accessToken,
            }),
          }
        );

        const containerData = (await containerRes.json()) as any;

        if (!containerRes.ok || containerData.error) {
          const err = containerData.error;
          const msg = `Meta API Container Error [${err?.code || containerRes.status}]: ${err?.message || 'Failed to create container'}`;
          PostModel.updatePost(postId, userId, { publishError: msg });
          throw new Error(msg);
        }

        const containerId = containerData.id;
        console.log(`[Meta Graph API] Step 1 Success! Container ID: ${containerId}`);

        // Step 2: Check Container Status
        console.log(`[Meta Graph API] Step 2: Polling container ${containerId} status...`);
        let isReady = false;
        let attempts = 0;
        const maxAttempts = 12;

        while (!isReady && attempts < maxAttempts) {
          attempts++;
          await new Promise((r) => setTimeout(r, 1800));

          const statusRes = await fetch(
            `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
          );
          const statusData = (await statusRes.json()) as any;

          if (statusData.status_code === 'FINISHED') {
            isReady = true;
            console.log(`[Meta Graph API] Step 2 Success! Status is FINISHED.`);
            break;
          } else if (statusData.status_code === 'ERROR') {
            const errDetail = statusData.status || 'Media processing error by Meta';
            throw new Error(`Meta Media Processing Error: ${errDetail}`);
          } else if (statusData.status_code === 'EXPIRED') {
            throw new Error('Meta media container expired before publishing.');
          }
        }

        // Step 3: Publish Container to Live Feed
        console.log(`[Meta Graph API] Step 3: Publishing container ${containerId} to feed...`);
        const publishRes = await fetch(
          `https://graph.facebook.com/v21.0/${igBusinessId}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: containerId,
              access_token: accessToken,
            }),
          }
        );

        const publishData = (await publishRes.json()) as any;
        if (!publishRes.ok || publishData.error) {
          const err = publishData.error;
          throw new Error(`Meta Publish Error [${err?.code || publishRes.status}]: ${err?.message || 'Publishing failed'}`);
        }

        const igMediaId = publishData.id;
        console.log(`[Meta Graph API] Step 3 Success! Live Instagram Media ID: ${igMediaId}`);

        // Step 4: Fetch Live Post Permalink
        let permalink = `https://www.instagram.com/p/${igMediaId}/`;
        try {
          const permalinkRes = await fetch(
            `https://graph.facebook.com/v21.0/${igMediaId}?fields=id,permalink,timestamp&access_token=${accessToken}`
          );
          const permalinkData = (await permalinkRes.json()) as any;
          if (permalinkData.permalink) {
            permalink = permalinkData.permalink;
          }
        } catch {
          // Permalink fallback
        }

        const now = new Date().toISOString();

        // Step 5: Save to Database
        PostModel.updatePost(postId, userId, {
          status: 'published',
          publishedAt: now,
          instagramMediaId: igMediaId,
          instagramPermalink: permalink,
          publishError: null,
        });

        return {
          success: true,
          message: 'Post successfully published to your Instagram profile!',
          instagramMediaId: igMediaId,
          permalink,
          publishedAt: now,
          accountUsed: {
            username: account.username,
            accountName: account.account_name,
            businessId: igBusinessId,
          },
        };
      } catch (metaErr: any) {
        console.error('[Meta Graph API Error]', metaErr);
        PostModel.updatePost(postId, userId, {
          publishError: metaErr.message || 'Meta API communication failed',
        });
        throw metaErr;
      }
    }

    PostModel.updatePost(post.id, userId, {
      publishError: 'Instagram is not connected with a live access token.',
    });
    throw new Error(
      'This Instagram account is not connected for direct publishing. Use Share and choose Instagram Post, Reel, or Chat to send the image with its caption and hashtags.'
    );
  },
};
