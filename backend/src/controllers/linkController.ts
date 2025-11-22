import { Request, Response } from 'express';
import { Link } from '../models/Link.js';
import { generateShortCode, validateShortCode, validateUrl } from '../utils/codeGenerator.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

// POST /api/links - Create a new shortened link
export const createLink = asyncHandler(async (req: Request, res: Response) => {
  const { longUrl, code } = req.body;

  // SECURITY: User must be authenticated
  if (!req.user?.userId) {
    throw new AppError(401, 'Authentication required');
  }

  // Validate longUrl
  if (!longUrl) {
    throw new AppError(400, 'longUrl is required');
  }

  if (!validateUrl(longUrl)) {
    throw new AppError(400, 'Invalid URL format');
  }

  // If custom code provided, validate it
  let shortCode = code;
  if (shortCode) {
    if (!validateShortCode(shortCode)) {
      throw new AppError(400, 'Short code must be 6-8 alphanumeric characters');
    }

    // Check if code already exists
    const existingLink = await Link.findOne({ code: shortCode });
    if (existingLink) {
      throw new AppError(409, 'Short code already in use');
    }

    shortCode = shortCode.toLowerCase();
  } else {
    // Generate random code
    let generated = false;
    let attempts = 0;
    while (!generated && attempts < 10) {
      shortCode = generateShortCode();
      const existingLink = await Link.findOne({ code: shortCode });
      if (!existingLink) {
        generated = true;
      }
      attempts++;
    }

    if (!generated) {
      throw new AppError(500, 'Failed to generate unique short code');
    }
  }

  // Create the link with userId
  const link = new Link({
    userId: req.user.userId,
    code: shortCode,
    longUrl,
    clicks: 0,
    lastClicked: null,
  });

  await link.save();

  res.status(201).json({
    success: true,
    data: {
      code: link.code,
      longUrl: link.longUrl,
      clicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
    },
  });
});

// GET /api/links - Get all links for the current user
export const getAllLinks = asyncHandler(async (req: Request, res: Response) => {
  // SECURITY: User must be authenticated
  if (!req.user?.userId) {
    throw new AppError(401, 'Authentication required');
  }

  // Filter links by userId only
  const links = await Link.find({ userId: req.user.userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: links.map((link: any) => ({
      code: link.code,
      longUrl: link.longUrl,
      clicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
    })),
  });
});

// GET /api/links/:code - Get stats for a specific link
export const getLinkStats = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;

  // SECURITY: User must be authenticated
  if (!req.user?.userId) {
    throw new AppError(401, 'Authentication required');
  }

  // Find link and verify user owns it
  const link = await Link.findOne({ code, userId: req.user.userId });

  if (!link) {
    throw new AppError(404, 'Link not found or unauthorized');
  }

  res.status(200).json({
    success: true,
    data: {
      code: link.code,
      longUrl: link.longUrl,
      clicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
    },
  });
});

// DELETE /api/links/:code - Delete a link
export const deleteLink = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;

  // SECURITY: User must be authenticated
  if (!req.user?.userId) {
    throw new AppError(401, 'Authentication required');
  }

  // Find and delete only if user owns it
  const link = await Link.findOneAndDelete({ code, userId: req.user.userId });

  if (!link) {
    throw new AppError(404, 'Link not found or unauthorized');
  }

  res.status(200).json({
    success: true,
    message: 'Link deleted successfully',
  });
});

// GET /:code - Redirect to the original URL
export const redirectLink = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;

  const link = await Link.findOneAndUpdate(
    { code },
    {
      $inc: { clicks: 1 },
      $set: { lastClicked: new Date() },
    },
    { new: true }
  );

  if (!link) {
    throw new AppError(404, 'Link not found');
  }

  // 302 Found redirect (temporary)
  res.redirect(302, link.longUrl);
});

// GET /healthz - Health check endpoint
export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
  });
};
