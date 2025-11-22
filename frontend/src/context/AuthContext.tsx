import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * User Type
 * Represents authenticated user information
 */
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Auth Context Type
 * Provides authentication state and methods throughout the app
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

/**
 * Create Auth Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * SECURITY:
 * - Manages user authentication state
 * - Auto-refreshes access token before expiry
 * - Handles token storage in httpOnly cookies
 * - Redirects on unauthorized access
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  /**
   * Fetch current user on app load
   * This validates if there's a valid access token in cookies
   */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include', // Include cookies in request
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [apiUrl]);

  /**
   * Auto-refresh access token
   * Runs every 10 minutes to keep user session alive
   * Before access token expires (15 minutes)
   */
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch {
        // Token refresh failed - user will be logged out on next request
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Register new user
   * @param email - User email
   * @param password - User password
   */
  const register = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // Response is not JSON (might be rate limiter plain text)
        throw new Error(await response.text());
      }

      if (!response.ok) {
        // Check if validation errors exist
        if (data.details) {
          const errorMessage = data.details
            .map((detail: { message: string }) => detail.message)
            .join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  };

  /**
   * Login user
   * @param email - User email
   * @param password - User password
   */
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // Response is not JSON (rate limiter or other plain text)
        throw new Error(await response.text());
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  };

  /**
   * Logout user
   * Clears user state and cookies
   */
  const logout = async () => {
    setError(null);
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  };

  /**
   * Refresh access token
   * Called periodically to keep session alive
   */
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Refresh failed - likely token expired
        setUser(null);
        throw new Error('Token refresh failed');
      }
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAccessToken,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
