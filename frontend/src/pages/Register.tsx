import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  /**
   * Evaluate password strength
   * Password must contain:
   * - At least 8 characters
   * - Uppercase letter
   * - Lowercase letter
   * - Number
   * - Special character
   */
  const evaluatePasswordStrength = (pwd: string) => {
    if (!pwd) {
      setPasswordStrength(null);
      return;
    }

    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[@$!%*?&]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    const strength = [hasUppercase, hasLowercase, hasNumber, hasSpecial, isLongEnough].filter(
      Boolean
    ).length;

    if (strength < 3) setPasswordStrength('weak');
    else if (strength < 5) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    evaluatePasswordStrength(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    if (password !== confirmPassword) {
      // This would be handled by form validation in a real app
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password);
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
                onChange={handlePasswordChange}
                className="w-full px-4 py-3.5 bg-slate-800/50 border border-cyan-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 focus:bg-slate-800/70 transition duration-300"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-700/50">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 transition-all duration-300 rounded-full ${
                          passwordStrength === 'weak'
                            ? 'bg-red-500'
                            : passwordStrength === 'medium'
                              ? i < 2
                                ? 'bg-yellow-500'
                                : 'bg-slate-700/30'
                              : 'bg-green-500'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs mt-2 text-cyan-300/60 font-medium">
                    {passwordStrength === 'weak'
                      ? '✕ Weak password'
                      : passwordStrength === 'medium'
                        ? '⚠ Medium strength'
                        : '✓ Strong password'}
                  </p>
                  <p className="text-xs mt-1 text-cyan-300/50">
                    Need: 8+ chars, uppercase, lowercase, number & special character
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-cyan-300/80 mb-3 uppercase tracking-widest">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/50 border border-cyan-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 focus:bg-slate-800/70 transition duration-300"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs mt-2 text-red-400 font-medium">✕ Passwords do not match</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/15 border border-red-400/40 backdrop-blur">
                <p className="text-red-200 text-sm font-medium">✕ {error}</p>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={
                isLoading || password !== confirmPassword || !password || passwordStrength !== 'strong'
              }
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-400/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-900/80 to-black/80 text-cyan-300/60">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full py-3.5 px-4 border-2 border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-cyan-100 font-semibold rounded-xl transition-all duration-300 text-center block hover:bg-cyan-500/10 backdrop-blur"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
