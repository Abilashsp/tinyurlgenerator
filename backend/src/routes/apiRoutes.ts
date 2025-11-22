import { Router } from 'express';
import {
  createLink,
  getAllLinks,
  getLinkStats,
  deleteLink,
} from '../controllers/linkController.js';
import { authMiddleware } from '../features/auth/middlewares/authMiddleware.js';

export const apiRouter = Router();

// All link endpoints require authentication
apiRouter.use(authMiddleware);

// POST /api/links - Create new link
apiRouter.post('/links', createLink);

// GET /api/links - Get user's links
apiRouter.get('/links', getAllLinks);

// GET /api/links/:code - Get link stats
apiRouter.get('/links/:code', getLinkStats);

// DELETE /api/links/:code - Delete link
apiRouter.delete('/links/:code', deleteLink);
