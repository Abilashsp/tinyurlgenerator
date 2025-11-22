import { Application } from "express";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

/**
 * Global Security Configuration
 * SECURITY: Protects against common web vulnerabilities
 */

/**
 * Helmet Configuration
 * SECURITY: Sets various HTTP headers to prevent attacks
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Legacy XSS protection
 * - Strict-Transport-Security: Forces HTTPS
 * - Content-Security-Policy: Prevents XSS, clickjacking, injection
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:5174"], // Allow frontend connection
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * CORS Configuration
 * SECURITY: Restricts which origins can access the API
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests without origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5174",
      "http://localhost:5173", // Vite default port
      "http://localhost:3000",  // Common React dev port
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
});

/**
 * Cookie Parser Configuration
 * SECURITY: Parses cookies from request headers
 * Secret is used to verify signed cookies
 */
export const cookieParserConfig = (app: Application): void => {
  app.use(
    cookieParser(
      process.env.COOKIE_SECRET ||
        "default-secret-change-in-production"
    )
  );
};

/**
 * Global Rate Limiter
 * SECURITY: Prevents DoS attacks by limiting requests
 * 100 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  // Return JSON so clients can parse the response
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT',
    });
  },
  standardHeaders: false, // Don't return the RateLimit-* headers
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === "/healthz";
  },
});

/**
 * API Rate Limiter
 * SECURITY: Specific limiter for API endpoints
 * 50 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Too many API requests, please try again later',
      code: 'RATE_LIMIT',
    });
  },
  standardHeaders: false,
});

/**
 * Apply All Security Middleware
 * @param app - Express application
 */
export const configureSecurityMiddleware = (app: Application): void => {
  // Helmet for secure headers
  app.use(helmetConfig);

  // CORS for cross-origin requests
  app.use(corsConfig);

  // Cookie parser
  cookieParserConfig(app);

  // Global rate limiter
  app.use(globalRateLimiter);

  // Trust proxy (for rate limiting behind reverse proxy)
  app.set("trust proxy", 1);

  // Disable powered-by header
  app.disable("x-powered-by");
};
