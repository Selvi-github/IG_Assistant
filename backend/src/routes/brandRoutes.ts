import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BrandModel } from '../models/brandModel.js';

export const brandRouter = Router();

// GET /api/brand - Get logged-in user's brand profile
brandRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const brand = await BrandModel.getByUserId(req.user!.id);
    res.json({
      success: true,
      hasBrand: Boolean(brand),
      brand,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve brand profile.',
    });
  }
});

// POST /api/brand - Create or update brand profile
brandRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { companyName, instagramHandle, bio, targetAudience, logoUrl, primaryColor } = req.body;

    if (!companyName || !companyName.trim()) {
      res.status(400).json({
        success: false,
        error: 'Company name is required.',
      });
      return;
    }

    if (!instagramHandle || !instagramHandle.trim()) {
      res.status(400).json({
        success: false,
        error: 'Instagram handle is required.',
      });
      return;
    }

    const brand = await BrandModel.upsert(req.user!.id, {
      companyName,
      instagramHandle,
      bio,
      targetAudience,
      logoUrl,
      primaryColor,
    });

    res.json({
      success: true,
      message: 'Brand details successfully saved.',
      brand,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save brand profile.',
    });
  }
});

