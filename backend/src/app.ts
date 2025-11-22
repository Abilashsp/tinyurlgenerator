import express from 'express';
import { config } from './config/index.js';
import { apiRouter } from './routes/apiRoutes.js';
import { redirectRouter } from './routes/redirectRoutes.js';
import { healthCheck } from './controllers/linkController.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './features/auth/routes/authRoutes.js';
import { configureSecurityMiddleware } from './common/security/config.js';

export const app = express();

// SECURITY: Configure all security middleware (helmet, cors, rate limiting, etc)
configureSecurityMiddleware(app);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint (no auth required)
app.get('/healthz', healthCheck);

// Auth routes (registration, login, logout, me)
app.use('/api/auth', authRouter);

// API routes (require authentication)
app.use('/api', apiRouter);

// Redirect routes (must be after API routes to avoid conflicts)
app.use('/', redirectRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);
