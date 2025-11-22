import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../../../common/security/jwt";

/**
 * Extend Express Request interface to include user info
 * SECURITY: Type-safe user access in protected routes
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

/**
 * Auth Middleware
 * SECURITY: Verifies JWT access token from cookies
 * Protects routes from unauthorized access
 *
 * Flow:
 * 1. Extract access token from HttpOnly cookie
 * 2. Verify token signature and expiration
 * 3. Attach user info to request object
 * 4. Continue to next middleware/route handler
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from HttpOnly cookie (CSRF-safe)
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({
        ok: false,
        error: "No access token provided",
        code: "NO_TOKEN",
      });
      return;
    }

    // Verify token and extract payload
    const payload = verifyToken(token, "access") as JwtPayload;

    // Attach user info to request
    req.user = {
      userId: payload.userId,
    };

    next();
  } catch (error) {
    const message = (error as Error).message;

    // Check if token is expired
    if (message.includes("jwt expired")) {
      res.status(401).json({
        ok: false,
        error: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    // Token is invalid or signature doesn't match
    res.status(401).json({
      ok: false,
      error: "Invalid or malformed access token",
      code: "INVALID_TOKEN",
    });
  }
};

/**
 * Optional Auth Middleware
 * Same as authMiddleware but doesn't reject if no token
 * Useful for public routes that benefit from user context
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const payload = verifyToken(token, "access") as JwtPayload;
      req.user = {
        userId: payload.userId,
      };
    }

    next();
  } catch {
    // Token exists but is invalid - continue anyway
    next();
  }
};
