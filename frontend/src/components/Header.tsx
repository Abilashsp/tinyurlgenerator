import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide header on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      // Error is handled by AuthContext
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <RouterLink 
            to={isAuthenticated ? '/dashboard' : '/'} 
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-300"
          >
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TinyLink
              </h1>
              <p className="text-xs text-gray-500 font-medium">URL Shortener</p>
            </div>
          </RouterLink>

          <nav className="flex gap-6 items-center">
            {isAuthenticated ? (
              <>
                <RouterLink
                  to="/dashboard"
                  className="relative font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300 group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </RouterLink>

                {/* User Info */}
                <div className="flex items-center gap-4 pl-6 border-l border-gray-300/20">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{user?.email}</p>
                    <p className="text-xs text-gray-500">Authenticated</p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <RouterLink
                  to="/login"
                  className="px-6 py-2 rounded-lg font-semibold text-gray-700 hover:bg-blue-100 transition-colors duration-300"
                >
                  Sign In
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Sign Up
                </RouterLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
