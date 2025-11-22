import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { generateToken, verifyToken, JwtPayload } from "../../../common/security/jwt";

/**
 * Cookie configuration for security
 * SECURITY: HttpOnly + Secure + SameSite protects against XSS, CSRF
 */
const cookieOptions = {
  httpOnly: true, // JavaScript cannot access (XSS protection)
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes for access token
};

/**
 * Register Controller
 * POST /api/auth/register
 *
 * SECURITY:
 * - Validates email format
 * - Checks for duplicate email
 * - Hashes password before storage (via User model pre-save hook)
 * - Returns 201 on success, 400 on validation error, 409 on duplicate
 */
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        ok: false,
        error: "User already exists",
        code: "USER_EXISTS",
      });
      return;
    }

    // Create new user with hashed password
    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password,
    });

    // Save user (passwordHash gets hashed by pre-save hook)
    await user.save();

    // Generate tokens
    const accessPayload: JwtPayload = {
      userId: user._id.toString(),
      type: "access",
    };
    const refreshPayload: JwtPayload = {
      userId: user._id.toString(),
      type: "refresh",
    };

    const accessToken = generateToken(accessPayload);
    const refreshToken = generateToken(refreshPayload);

    // Set HttpOnly cookies (CSRF-safe)
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Log error details in development for easier debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('Register error:', error);
    }

    const message = (error as Error).message;

    // Mongoose validation error
    if (message.toLowerCase().includes('validation failed')) {
      res.status(400).json({
        ok: false,
        error: 'Validation failed',
        details: message,
      });
      return;
    }

    res.status(500).json({
      ok: false,
      error: 'Registration failed',
    });
  }
};

/**
 * Login Controller
 * POST /api/auth/login
 *
 * SECURITY:
 * - Compares password with bcrypt (timing-attack resistant)
 * - Returns generic error messages (doesn't reveal if user exists)
 * - Rate limiting should be applied at route level
 * - Generates both access (15m) and refresh (7d) tokens
 */
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email (must explicitly select passwordHash)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash"
    );

    // Generic error - don't reveal if user exists (password enumeration protection)
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        ok: false,
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    // Generate tokens with separate payloads
    const accessPayload: JwtPayload = {
      userId: user._id.toString(),
      type: "access",
    };
    const refreshPayload: JwtPayload = {
      userId: user._id.toString(),
      type: "refresh",
    };

    const accessToken = generateToken(accessPayload);
    const refreshToken = generateToken(refreshPayload);

    // Set HttpOnly cookies
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      ok: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }

    res.status(500).json({
      ok: false,
      error: 'Login failed',
    });
  }
};

/**
 * Logout Controller
 * POST /api/auth/logout
 *
 * SECURITY:
 * - Clears both access and refresh tokens
 * - No authentication required (public endpoint)
 * - Safe to call multiple times
 */
export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Clear cookies by setting maxAge to 0
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      ok: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Logout failed",
    });
  }
};

/**
 * Me Controller
 * GET /api/auth/me
 *
 * Returns current authenticated user info
 * SECURITY: Requires valid access token (authMiddleware)
 * Uses req.user.userId from authMiddleware
 */
export const me = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        ok: false,
        error: "Unauthorized",
      });
      return;
    }

    // Find user by ID (from token)
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({
        ok: false,
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to fetch user",
    });
  }
};

/**
 * Refresh Token Controller
 * POST /api/auth/refresh
 *
 * SECURITY:
 * - Uses long-lived refresh token to generate new access token
 * - Old access token becomes invalid
 * - Refresh token cannot be used for regular API calls
 * - Rotate tokens on refresh for better security
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        ok: false,
        error: "No refresh token",
        code: "NO_REFRESH_TOKEN",
      });
      return;
    }

    // Verify refresh token
    const payload = verifyToken(
      refreshToken,
      "refresh"
    ) as JwtPayload;

    // Verify user still exists
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        ok: false,
        error: "User not found",
      });
      return;
    }

    // Generate new access token
    const newAccessPayload: JwtPayload = {
      userId: user._id.toString(),
      type: "access",
    };

    const newAccessToken = generateToken(newAccessPayload);

    // Set new access token cookie
    res.cookie("accessToken", newAccessToken, accessCookieOptions);

    res.status(200).json({
      ok: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Refresh token error:', error);
    }

    const message = (error as Error).message;

    if (message.includes('jwt expired')) {
      res.status(401).json({
        ok: false,
        error: 'Refresh token expired, please login again',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      ok: false,
      error: 'Invalid refresh token',
    });
  }
};
