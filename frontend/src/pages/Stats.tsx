import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLinkStats } from '../hooks/useApi';

export const Stats = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { link, loading, error, fetchStats } = useLinkStats(code || '');

  useEffect(() => {
    if (code) {
      fetchStats();
      // Refresh stats every 5 seconds
      const interval = setInterval(() => fetchStats(), 5000);
      return () => clearInterval(interval);
    }
  }, [code, fetchStats]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-96">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
          <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-600 animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-6 btn-premium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
        >
          ← Back to Dashboard
        </button>
        <div className="glass rounded-2xl p-8 border border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <div className="flex items-start gap-4">
            <span className="text-3xl">❌</span>
            <div>
              <h3 className="font-bold text-lg text-red-700 mb-2">Error Loading Statistics</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-6 btn-premium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
        >
          ← Back to Dashboard
        </button>
        <div className="glass rounded-2xl p-8 border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-lg text-yellow-700 mb-2">Link Not Found</h3>
              <p className="text-yellow-600">This short link doesn't exist or has been deleted.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use backend URL for short links since that's where the redirect endpoint is
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const baseUrl = backendUrl.replace('/api', ''); // Remove /api if present
  const shortUrl = `${baseUrl}/${link.code}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-8 btn-premium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      {/* Stats Container */}
      <div className="glass rounded-2xl shadow-2xl p-10 border-2 border-blue-300/50 bg-gradient-to-br from-white/90 to-blue-50/90">
        {/* Header */}
        <div className="mb-10 pb-6 border-b-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📊</span>
            <h1 className="text-4xl font-bold text-gray-800">
              Link Statistics
            </h1>
          </div>
          <p className="text-gray-700 text-lg ml-14 font-semibold">
            Detailed insights for code <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">{link.code}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Short URL Card */}
          <div className="glass rounded-xl p-6 border border-blue-300/50 hover:border-blue-400/80 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Short URL</h3>
              <span className="text-2xl">🔗</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-blue-900 flex-1 truncate bg-white/60 px-4 py-2 rounded-lg">
                {shortUrl}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shortUrl);
                  const btn = event?.target as HTMLButtonElement;
                  btn.textContent = '✅';
                  setTimeout(() => {
                    btn.textContent = '📋';
                  }, 2000);
                }}
                className="btn-premium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all duration-300 shadow-md"
              >
                📋
              </button>
            </div>
          </div>

          {/* Clicks Card */}
          <div className="glass rounded-xl p-6 border border-green-300/50 hover:border-green-400/80 transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide">Total Clicks</h3>
              <span className="text-2xl">👁️</span>
            </div>
            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-bold text-green-700">{link.clicks}</p>
              <p className="text-xs text-green-600 font-medium">Updated live</p>
            </div>
          </div>

          {/* Long URL Card */}
          <div className="md:col-span-2 glass rounded-xl p-6 border border-purple-300/50 hover:border-purple-400/80 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide">Original URL</h3>
              <span className="text-2xl">🌐</span>
            </div>
            <a
              href={link.longUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-900 break-all font-medium underline decoration-dashed transition-colors duration-300 block bg-white/60 px-4 py-3 rounded-lg"
              title={link.longUrl}
            >
              {link.longUrl}
            </a>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="space-y-4 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📝</span> Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-lg p-4 border border-gray-300 bg-gradient-to-br from-white to-gray-50">
              <span className="text-sm text-gray-700 uppercase tracking-wide font-bold">Created</span>
              <p className="text-gray-800 font-semibold mt-2 text-lg">
                {new Date(link.createdAt).toLocaleString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <div className="glass rounded-lg p-4 border border-gray-300 bg-gradient-to-br from-white to-gray-50">
              <span className="text-sm text-gray-700 uppercase tracking-wide font-bold">Last Clicked</span>
              <p className="text-gray-800 font-semibold mt-2 text-lg">
                {link.lastClicked
                  ? new Date(link.lastClicked).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '🔸 Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-white/20">
          <button
            onClick={() => {
              window.open(link.longUrl, '_blank');
            }}
            className="btn-premium flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-lg"
          >
            🌐 Visit Original URL
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-premium flex-1 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-lg shadow-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
