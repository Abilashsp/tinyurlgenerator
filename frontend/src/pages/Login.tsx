import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled by AuthContext and displayed below
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex flex-col items-center justify-center px-4">
      {/* App Title */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">TinyLink</h1>
      </div>

      <div className="w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="rounded-3xl p-8 shadow-2xl border border-cyan-400/20 backdrop-blur-2xl bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-cyan-300/80 mb-3 uppercase tracking-widest">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/50 border border-cyan-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 focus:bg-slate-800/70 transition duration-300"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-cyan-300/80 mb-3 uppercase tracking-widest">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/50 border border-cyan-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 focus:bg-slate-800/70 transition duration-300"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/15 border border-red-400/40 backdrop-blur">
                <p className="text-red-200 text-sm font-medium">✕ {error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-400/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-900/80 to-black/80 text-cyan-300/60">
                New user?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="w-full py-3.5 px-4 border-2 border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-cyan-100 font-semibold rounded-xl transition-all duration-300 text-center block hover:bg-cyan-500/10 backdrop-blur"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
