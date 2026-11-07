import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { InstagramPublishService } from '../services/instagramPublishService.js';
import { ConnectedAccountModel } from '../models/connectedAccountModel.js';
import { PostModel } from '../models/postModel.js';

export const instagramRouter = Router();

// GET /api/instagram/account - Get connected Instagram account details
instagramRouter.get('/account', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const account = await InstagramPublishService.getConnectedInstagramAccount(req.user!.id);
    res.json({
      success: true,
      account,
      hasLiveToken: Boolean(account?.access_token && account?.instagram_business_id),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve connected Instagram account.',
    });
  }
});

// POST /api/instagram/connect-manual - Connect or update Instagram handle and optional token
instagramRouter.post('/connect-manual', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, accessToken, instagramBusinessId, accountName } = req.body;

    if (!username || !username.trim()) {
      res.status(400).json({
        success: false,
        error: 'Instagram username is required.',
      });
      return;
    }

    const cleanUsername = username.replace('@', '').trim();

    const account = await ConnectedAccountModel.upsertAccount(req.user!.id, {
      platform: 'instagram',
      accountType: 'instagram_business',
      username: cleanUsername,
      accountName: accountName?.trim() || cleanUsername,
      accessToken: accessToken?.trim() || null,
      instagramBusinessId: instagramBusinessId?.trim() || null,
    });

    res.json({
      success: true,
      message: `Instagram account @${cleanUsername} connected successfully.`,
      account,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect Instagram account.',
    });
  }
});

// POST /api/instagram/publish - Real Meta Graph API Content Publishing
instagramRouter.post('/publish', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId, imageUrl, caption, hashtags } = req.body;

    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'postId is required for publishing.',
      });
      return;
    }

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        error: 'imageUrl is required for publishing.',
      });
      return;
    }

    const result = await InstagramPublishService.publishImagePost({
      userId: req.user!.id,
      postId,
      imageUrl,
      caption: caption || '',
      hashtags,
    });

    res.json({
      success: true,
      message: result.message,
      instagramMediaId: result.instagramMediaId,
      permalink: result.permalink,
      publishedAt: result.publishedAt,
      accountUsed: result.accountUsed,
    });
  } catch (error: any) {
    console.error('[Publish Route Error]', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Instagram publishing failed.',
    });
  }
});

// GET /api/instagram/status/:postId - Check post publishing status
instagramRouter.get('/status/:postId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.postId);
    const post = await PostModel.getPostById(postId, req.user!.id);

    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found.' });
      return;
    }

    res.json({
      success: true,
      post: {
        id: post.id,
        status: post.status,
        publishedAt: post.published_at,
        instagramMediaId: post.instagram_media_id,
        permalink: post.instagram_permalink,
        publishError: post.publish_error,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check status.',
    });
  }
});

