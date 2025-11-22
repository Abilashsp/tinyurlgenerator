import { useNavigate } from 'react-router-dom';
import type { Link } from '../types/index';

interface LinkTableProps {
  links: Link[];
  onDelete: (code: string) => Promise<void>;
  isDeleting: string | null;
}

export const LinkTable = ({ links, onDelete, isDeleting }: LinkTableProps) => {
  const navigate = useNavigate();

  const handleCopyToClipboard = (code: string) => {
    // Use backend URL for short links since that's where the redirect endpoint is
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = backendUrl.replace('/api', ''); // Remove /api if present
    const shortUrl = `${baseUrl}/${code}`;
    navigator.clipboard.writeText(shortUrl).then(() => {
      // Show toast-like feedback
      const btn = event?.target as HTMLButtonElement;
      const originalText = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  };

  const handleDelete = async (code: string) => {
    if (window.confirm(`Are you sure you want to delete ${code}?`)) {
      try {
        await onDelete(code);
      } catch {
        // Error is handled by parent
      }
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/30 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 first:rounded-tl-2xl">
                <span className="flex items-center gap-2">📝 Code</span>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <span className="flex items-center gap-2">🌐 Original URL</span>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <span className="flex items-center gap-2">👁️ Clicks</span>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <span className="flex items-center gap-2">📅 Created</span>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 last:rounded-tr-2xl">
                <span className="flex items-center gap-2">⚡ Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                key={link.code}
                className="border-b border-white/10 hover:bg-white/30 transition-all duration-300 group"
              >
                {/* Code */}
                <td className="px-6 py-4 text-sm">
                  <div className="font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-lg">
                    {link.code}
                  </div>
                </td>

                {/* Original URL (truncated) */}
                <td className="px-6 py-4 text-sm max-w-xs">
                  <a
                    href={link.longUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-purple-600 font-medium underline decoration-dashed truncate block transition-colors duration-300"
                    title={link.longUrl}
                  >
                    {link.longUrl}
                  </a>
                </td>

                {/* Clicks */}
                <td className="px-6 py-4 text-sm">
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 border border-green-200">
                    👁️ {link.clicks}
                  </span>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {new Date(link.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {/* View Stats */}
                    <button
                      onClick={() => navigate(`/stats/${link.code}`)}
                      className="btn-premium bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg"
                      title="View statistics"
                    >
                      📊 Stats
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopyToClipboard(link.code)}
                      className="btn-premium bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg"
                      title="Copy short link"
                    >
                      📋 Copy
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(link.code)}
                      disabled={isDeleting === link.code}
                      className="btn-premium bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                      title="Delete link"
                    >
                      {isDeleting === link.code ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

