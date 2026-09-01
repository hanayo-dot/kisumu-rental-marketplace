import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { IconUser, IconSearch, IconDashboard, IconLogout } from '../components/Icons';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen text-slate-100 font-smooth">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-dark-card rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <IconUser className="w-5 h-5" />
                <span className="text-xs uppercase font-bold tracking-wider">User Account</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">Welcome back, {user.full_name}</h1>
              <p className="mt-1 text-sm text-slate-300">Manage your profile details and account quick actions.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/search"
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-center text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
              >
                <IconSearch className="w-4 h-4" />
                <span>Search Homes</span>
              </Link>
              {user.user_type === 'landlord' && (
                <Link
                  to="/landlord/dashboard"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-center text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  <IconDashboard className="w-4 h-4" />
                  <span>Landlord Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Account Overview</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</p>
                  <p className="text-white font-medium mt-1">{user.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</p>
                  <p className="text-white font-medium mt-1">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="text-white font-medium mt-1">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p>
                  <p className="text-indigo-400 font-bold capitalize mt-1">{user.user_type}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">Session Control</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Log out of your current session safely on this device.
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 px-5 py-3 text-xs font-semibold hover:bg-rose-600 hover:text-white transition"
              >
                <IconLogout className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
