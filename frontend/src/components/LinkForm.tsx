import { useState } from 'react';
import type { CreateLinkPayload } from '../types/index';

interface LinkFormProps {
  onSubmit: (payload: CreateLinkPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onSuccess?: () => void;
}

export const LinkForm = ({ onSubmit, isLoading, error, onSuccess }: LinkFormProps) => {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    if (!longUrl.trim()) {
      setLocalError('URL is required');
      return;
    }

    if (customCode && !/^[A-Za-z0-9]{6,8}$/.test(customCode)) {
      setLocalError('Custom code must be 6-8 alphanumeric characters');
      return;
    }

    try {
      await onSubmit({
        longUrl: longUrl.trim(),
        code: customCode.trim() || undefined,
      });
      setLongUrl('');
      setCustomCode('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch {
      // Error is handled by parent component
    }
  };

  const displayError = localError || error;

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-8 mb-8 border border-blue-200/50 shadow-xl bg-gradient-to-br from-white/80 to-blue-50/80"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✨</span>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
            Create Shortened Link
          </h2>
        </div>
        <p className="text-gray-700 text-sm font-medium">Paste your URL and get a short link instantly</p>
      </div>

      <div className="space-y-6">
        {/* Long URL Input */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Long URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 font-medium text-gray-800"
              disabled={isLoading}
            />
            <span className="absolute right-3 top-3 text-2xl">🔗</span>
          </div>
        </div>

        {/* Custom Code Input */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Custom Code <span className="text-gray-600 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="mycode (6-8 alphanumeric characters)"
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 font-medium text-gray-800"
              disabled={isLoading}
            />
            <span className="absolute right-3 top-3 text-2xl">⚙️</span>
          </div>
          <p className="text-xs text-gray-700 mt-2 font-medium">
            💡 Leave blank to auto-generate. Must be 6-8 alphanumeric characters.
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="success-message bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl flex items-start gap-3 font-medium">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{displayError}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-xl flex items-start gap-3 font-medium">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">Link created successfully!</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-premium w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl disabled:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner">⏳</span>
              Creating...
            </span>
          ) : (
            '🚀 Create Link'
          )}
        </button>
      </div>
    </form>
  );
};
