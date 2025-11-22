import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Link, CreateLinkPayload, ApiResponse } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Configure axios instance with security features
 * SECURITY:
 * - withCredentials: true sends cookies with requests
 * - Allows backend to read httpOnly cookies
 * - Enables CSRF protection via SameSite cookies
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in all requests
});

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<Link[]>>(`/api/links`);
      if (response.data.success && response.data.data) {
        setLinks(response.data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch links';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLink = useCallback(
    async (payload: CreateLinkPayload) => {
      setError(null);
      try {
        const response = await axiosInstance.post<ApiResponse<Link>>(
          `/api/links`,
          payload
        );
        if (response.data.success && response.data.data) {
          setLinks((prev) => [response.data.data!, ...prev]);
          return response.data.data;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create link';
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  const deleteLink = useCallback(async (code: string) => {
    setError(null);
    try {
      await axiosInstance.delete(`/api/links/${code}`);
      setLinks((prev) => prev.filter((link) => link.code !== code));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete link';
      setError(message);
      throw new Error(message);
    }
  }, []);

  return {
    links,
    loading,
    error,
    fetchLinks,
    createLink,
    deleteLink,
    setError,
  };
};

export const useLinkStats = (code: string) => {
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<Link>>(
        `/api/links/${code}`
      );
      if (response.data.success && response.data.data) {
        setLink(response.data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  return {
    link,
    loading,
    error,
    fetchStats,
  };
};
