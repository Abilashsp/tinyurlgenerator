import { Router } from "express";
import { register, login, logout, me, refreshAccessToken } from "../controllers/authController";
import { validate, schemas } from "../middlewares/validationMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import rateLimit from "express-rate-limit";

/**
 * Rate Limiter for Login
 * SECURITY: Prevents brute force attacks
 * 5 requests per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  // Return JSON so frontend can parse errors consistently
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Too many login attempts, please try again later',
      code: 'RATE_LIMIT',
    });
  },
  standardHeaders: false, // Return custom format
  skip: (req) => req.method !== "POST", // Only count POST requests
});

/**
 * Rate Limiter for Registration
 * SECURITY: Prevents spam account creation
 * 3 requests per hour per IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per windowMs
  // Return JSON so frontend can parse errors consistently
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Too many registration attempts, please try again later',
      code: 'RATE_LIMIT',
    });
  },
  standardHeaders: false,
});

/**
 * Auth Router
 * All authentication endpoints with security middleware
 */
const authRouter = Router();

/**
 * POST /api/auth/register
 * Register new user
 * Rate limited to prevent spam
 * Validates email format and password strength
 */
authRouter.post(
  "/register",
  registerLimiter,
  validate(schemas.register),
  asyncHandler(register)
);

/**
 * POST /api/auth/login
 * Authenticate user and return tokens in HttpOnly cookies
 * Rate limited to prevent brute force
 * Uses generic error message for security
 */
authRouter.post("/login", loginLimiter, validate(schemas.login), asyncHandler(login));

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 * Public endpoint (doesn't require authentication)
 */
authRouter.post("/logout", asyncHandler(logout));

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires valid access token
 */
authRouter.get("/me", authMiddleware, asyncHandler(me));

/**
 * POST /api/auth/refresh
 * Generate new access token using refresh token
 * Used when access token expires
 */
authRouter.post("/refresh", asyncHandler(refreshAccessToken));

export default authRouter;
