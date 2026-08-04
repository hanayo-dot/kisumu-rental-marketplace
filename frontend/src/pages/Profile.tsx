import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-lg border border-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">My profile</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back, {user.full_name}</h1>
              <p className="mt-2 text-slate-600">Manage your account details and quick actions for your next move.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/search"
                className="rounded-full bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Search homes
              </Link>
              {user.user_type === 'landlord' && (
                <Link
                  to="/landlord/dashboard"
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Manage listings
                </Link>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Phone</p>
                  <p>{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Role</p>
                  <p className="capitalize">{user.user_type}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Need help?</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Visit the landing page, search properties, or manage your landlord dashboard from here.
              </p>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Log out and return home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
