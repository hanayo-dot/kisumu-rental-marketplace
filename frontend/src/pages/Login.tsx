import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconHome, IconUser } from '../components/Icons';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      if (userData?.user_type === 'landlord') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/search');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-smooth flex items-center justify-center p-4">
      <div className="glass-dark-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-700">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
            <IconUser className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white text-center">Welcome Back</h1>
        <p className="text-xs text-slate-300 text-center mt-1 mb-6">Sign in to your Kisumu Rental account</p>
        
        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 rounded-xl text-xs backdrop-blur">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 disabled:bg-slate-800 transition shadow-lg shadow-indigo-600/30 text-sm mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3 text-xs">
          <p className="text-slate-400">Don&apos;t have an account?</p>
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 font-bold hover:text-indigo-300 transition"
          >
            Create one here
          </button>
          <div className="pt-2">
            <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200">
              <IconHome className="w-3.5 h-3.5" />
              <span>Back to Landing Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
