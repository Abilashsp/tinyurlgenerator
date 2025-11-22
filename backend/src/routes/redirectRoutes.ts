import { Router } from 'express';
import { redirectLink } from '../controllers/linkController.js';

export const redirectRouter = Router();

// GET /:code - Redirect endpoint (catch-all for short codes)
redirectRouter.get('/:code', redirectLink);
