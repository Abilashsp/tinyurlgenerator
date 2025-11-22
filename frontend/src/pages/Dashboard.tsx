import { useEffect, useState } from 'react';
import type { CreateLinkPayload } from '../types/index';
import { LinkForm } from '../components/LinkForm';
import { LinkTable } from '../components/LinkTable';
import { useLinks } from '../hooks/useApi';

export const Dashboard = () => {
  const { links, loading, error, fetchLinks, createLink, deleteLink } = useLinks();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreateLink = async (payload: CreateLinkPayload) => {
    setCreateError(null);
    try {
      await createLink(payload);
      await fetchLinks(); // Refresh the list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create link';
      setCreateError(message);
      throw err;
    }
  };

  const handleDeleteLink = async (code: string) => {
    setDeleting(code);
    try {
      await deleteLink(code);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Premium Header Section */}
      <div className="mb-12 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-700 rounded-full shadow-lg"></div>
          <h1 className="text-5xl font-bold text-gray-800">
            Dashboard
          </h1>
        </div>
        <p className="text-gray-700 text-lg ml-4 font-semibold">
          Create, manage, and track your shortened URLs with ease
        </p>
      </div>

      {/* Form Section with Glassmorphism */}
      <div className="mb-12">
        <LinkForm
          onSubmit={handleCreateLink}
          isLoading={false}
          error={createError}
          onSuccess={() => setCreateError(null)}
        />
      </div>

      {/* Links Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-blue-700 rounded-full shadow-lg"></div>
            <h2 className="text-3xl font-bold text-gray-800">Your Links</h2>
          </div>
          {!loading && links.length > 0 && (
            <div className="px-4 py-2 rounded-full bg-blue-100 border-2 border-blue-300">
              <span className="text-sm font-bold text-blue-800">
                {links.length} {links.length === 1 ? 'Link' : 'Links'}
              </span>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl shadow-md backdrop-blur-sm font-medium">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold mb-1">Error Loading Links</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
              <div className="absolute inset-1 rounded-full border-3 border-transparent border-t-blue-500 border-r-purple-600 animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading your links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-xl glass bg-gradient-to-br from-white/90 to-blue-50/90 border-2 border-blue-200">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Links Yet</h3>
            <p className="text-gray-700 font-medium">Create your first shortened link above to get started!</p>
          </div>
        ) : (
          <LinkTable
            links={links}
            onDelete={handleDeleteLink}
            isDeleting={deleting}
          />
        )}
      </div>
    </div>
  );
};
