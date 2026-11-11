import { Router, Response } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BrandModel } from '../models/brandModel.js';
import { AiImageService } from '../services/aiImageService.js';
import { AiVideoService } from '../services/aiVideoService.js';
import { CaptionRagService } from '../services/captionRagService.js';
import { AudioService } from '../services/audioService.js';
import { ImageRetrievalService } from '../services/imageRetrievalService.js';

export const aiRouter = Router();

async function resolveBrandIdentity(req: AuthenticatedRequest): Promise<{ brandName: string; instagramHandle: string }> {
  let brandName = req.body?.brandName || 'My Brand';
  let instagramHandle = req.body?.instagramHandle || '@creator';

  if (req.user?.id) {
    const brand = await BrandModel.getByUserId(req.user.id);
    if (brand?.company_name) brandName = brand.company_name;
    else if (req.user.brand_name) brandName = req.user.brand_name;

    if (brand?.instagram_handle) instagramHandle = brand.instagram_handle;
    else if (req.user.instagram_handle) instagramHandle = req.user.instagram_handle;
  }

  return { brandName, instagramHandle };
}

// GET /api/ai/audio - openly licensed tracks the user can preview and attach
aiRouter.get('/audio', async (req, res): Promise<void> => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : 'trending english';
    const tracks = await AudioService.search(query);
    res.json({ success: true, tracks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Could not load audio.' });
  }
});

// POST /api/ai/captions - Generate 3 distinct concept-accurate caption options via RAG
aiRouter.post('/captions', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prompt, tone = 'creative' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a description or prompt for caption generation.',
      });
      return;
    }

    let brandName = req.body.brandName || '';
    let brandCategory = req.body.brandCategory || '';
    let brandBio = req.body.brandBio || '';

    if (req.user?.id) {
      const brand = await BrandModel.getByUserId(req.user.id);
      if (brand?.company_name) brandName = brand.company_name;
      else if (req.user.brand_name) brandName = req.user.brand_name;

      if (brand?.bio) brandBio = brand.bio;
    }

    const result = await CaptionRagService.generateCaptions({
      prompt: prompt.trim(),
      brandName,
      brandCategory,
      brandBio,
      tone,
    });

    res.json({
      success: true,
      message: 'Captions generated successfully via RAG engine.',
      detected_concept: result.detected_concept,
      content_category: result.content_category,
      captions: result.captions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Caption generation failed.',
    });
  }
});

// POST /api/ai/photos/search - licensed photo retrieval ranked with CLIP
aiRouter.post('/photos/search', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (prompt.length < 3) {
      res.status(400).json({ success: false, error: 'Enter a description to search photos.' });
      return;
    }
    const result = await ImageRetrievalService.search(prompt);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Photo search failed.' });
  }
});

// POST /api/ai/photos/use - save a selected licensed photo into the post
aiRouter.post('/photos/use', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    if (!id) {
      res.status(400).json({ success: false, error: 'Choose a photo first.' });
      return;
    }
    const saved = await ImageRetrievalService.saveSelected(id);
    res.json({ success: true, ...saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Could not use that photo.' });
  }
});

// POST /api/ai/video-jobs - Submit async 9:16 vertical video Reel render job
aiRouter.post('/video-jobs', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({
        success: false,
        error: 'Please provide a description for your video.',
      });
      return;
    }

    const { brandName, instagramHandle } = await resolveBrandIdentity(req);
    const job = AiVideoService.submitJob({
      userId: req.user?.id || null,
      prompt,
      brandName,
      instagramHandle,
    });

    res.status(202).json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
    });
  } catch (error: any) {
    const isQueueFull = /busy/i.test(error?.message || '');
    res.status(isQueueFull ? 429 : 500).json({
      success: false,
      error: error.message || 'Could not queue video job.',
    });
  }
});

// GET /api/ai/video-jobs/:jobId - Poll video render progress & completed result
aiRouter.get('/video-jobs/:jobId', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const jobId = String(req.params.jobId || '');
  const job = AiVideoService.getJob(jobId, req.user?.id || null);
  if (!job) {
    res.status(404).json({
      success: false,
      error: 'Video job not found or expired.',
    });
    return;
  }

  res.json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    result: job.status === 'succeeded' ? job.result : undefined,
    error: job.status === 'failed' ? job.error : undefined,
  });
});

// POST /api/ai/video-jobs/:jobId/cancel - Cancel queued video job
aiRouter.post('/video-jobs/:jobId/cancel', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const jobId = String(req.params.jobId || '');
  const cancelled = AiVideoService.cancelJob(jobId, req.user?.id || null);
  res.json({ success: true, cancelled });
});

// POST /api/ai/generate - Generate AI Images (default), Carousels, or Reel Video
aiRouter.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prompt, postType = 'image', slidesCount = 4 } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a description or prompt for the AI post.',
      });
      return;
    }

    const { brandName, instagramHandle } = await resolveBrandIdentity(req);

    if (postType === 'video' || postType === 'reel') {
      const videoResult = await AiVideoService.generateVideoPost({
        userId: req.user?.id || null,
        prompt,
        brandName,
        instagramHandle,
      });

      res.json({
        success: true,
        message: 'Vertical 9:16 Reel video generated successfully.',
        result: videoResult,
      });
      return;
    }

    const result = await AiImageService.generatePost({
      prompt,
      postType: postType === 'carousel' ? 'carousel' : 'image',
      slidesCount: Number(slidesCount) || 4,
      brandName,
      instagramHandle,
    });

    res.json({
      success: true,
      message: 'AI post generated successfully.',
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'AI generation failed.',
    });
  }
});
