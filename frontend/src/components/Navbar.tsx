import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
              Kisumu Rentals
            </Link>
            <nav className="hidden md:flex items-center gap-3 text-sm text-slate-700">
              <Link className={`${location.pathname === '/search' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-700'}`} to="/search">
                Search
              </Link>
              <Link className={`${location.pathname === '/favorites' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-700'}`} to="/favorites">
                Favorites
              </Link>
              <Link className={`${location.pathname === '/profile' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-700'}`} to="/profile">
                Profile
              </Link>
              {user?.user_type === 'landlord' && (
                <Link className={`${location.pathname === '/landlord/dashboard' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-700'}`} to="/landlord/dashboard">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-600">Hi, {user.full_name}</span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
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
