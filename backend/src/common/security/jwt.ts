import jwt from "jsonwebtoken";

/**
 * JWT Token Types
 */
export type TokenType = "access" | "refresh";

/**
 * JWT Payload Interface
 * Minimal payload reduces token size and attack surface
 */
export interface JwtPayload {
  userId: string;
  type: TokenType;
}

interface TokenConfig {
  expiresIn: string;
  secret: string;
}

/**
 * Token Configuration
 * Separate tokens for access (short-lived) and refresh (long-lived)
 */
const tokenConfigMap: Record<TokenType, TokenConfig> = {
  access: {
    expiresIn: "15m", // 15 minutes
    secret: process.env.JWT_ACCESS_SECRET || "access-secret-key-change-in-production",
  },
  refresh: {
    expiresIn: "7d", // 7 days
    secret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key-change-in-production",
  },
};

/**
 * Generate JWT Token
 * @param payload - Token payload (userId, type)
 * @returns Signed JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  const config = tokenConfigMap[payload.type];
  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn,
  } as jwt.SignOptions);
};

/**
 * Verify JWT Token
 * @param token - JWT token to verify
 * @param type - "access" or "refresh"
 * @returns Decoded payload or throws error
 */
export const verifyToken = (token: string, type: TokenType): JwtPayload => {
  try {
    const config = tokenConfigMap[type];
    const decoded = jwt.verify(token, config.secret) as JwtPayload;

    // Double-check token type matches expected
    if (decoded.type !== type) {
      throw new Error(`Token type mismatch. Expected ${type}, got ${decoded.type}`);
    }

    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${(error as Error).message}`);
  }
};

/**
 * Decode JWT without verification (for debugging)
 * @param token - JWT token
 * @returns Decoded payload
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
