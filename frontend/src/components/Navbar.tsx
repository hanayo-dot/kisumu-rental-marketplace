import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconHome, IconSearch, IconHeart, IconUser, IconDashboard, IconLogout } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-white tracking-wide">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/30">
                <IconHome className="w-5 h-5" />
              </div>
              <span>Kisumu<span className="text-indigo-400 font-normal">Rentals</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-sm">
              <Link
                to="/search"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
                  location.pathname === '/search'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <IconSearch className="w-4 h-4" />
                <span>Search</span>
              </Link>

              <Link
                to="/favorites"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
                  location.pathname === '/favorites'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <IconHeart className="w-4 h-4" />
                <span>Favorites</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
                  location.pathname === '/profile'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <IconUser className="w-4 h-4" />
                <span>Profile</span>
              </Link>

              {user?.user_type === 'landlord' && (
                <Link
                  to="/landlord/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
                    location.pathname === '/landlord/dashboard'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <IconDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-slate-300 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full">
                  Hi, <strong className="text-white">{user.full_name}</strong> ({user.user_type})
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-700/80 hover:text-white transition"
                >
                  <IconLogout className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
