import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { PostModel } from '../models/postModel.js';

export const postRouter = Router();

// GET /api/posts - Get logged-in user's posts & stats
postRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const posts = await PostModel.getPostsByUserId(req.user!.id);
    const stats = await PostModel.getStatsByUserId(req.user!.id);

    res.json({
      success: true,
      posts,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve posts.',
    });
  }
});

// POST /api/posts - Create post for logged-in user
postRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, caption, hashtags, postType, status, scheduledFor, thumbnailUrl, mediaUrls } = req.body;

    if (!title || !caption) {
      res.status(400).json({
        success: false,
        error: 'Post title and caption are required.',
      });
      return;
    }

    const post = await PostModel.createPost(req.user!.id, {
      title,
      caption,
      hashtags,
      postType,
      status,
      scheduledFor,
      thumbnailUrl,
      mediaUrls,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create post.',
    });
  }
});

// PATCH /api/posts/:id - Update post status (published / scheduled)
postRouter.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const { status, scheduledFor, publishedAt, thumbnailUrl } = req.body;

    await PostModel.updatePost(postId, req.user!.id, {
      status,
      scheduledFor,
      publishedAt,
      thumbnailUrl,
    });

    res.json({
      success: true,
      message: 'Post updated.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update post.',
    });
  }
});

// DELETE /api/posts/:id - Delete post
postRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    await PostModel.deletePost(postId, req.user!.id);
    res.json({
      success: true,
      message: 'Post deleted.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete post.',
    });
  }
});
