import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconHome, IconUser } from '../components/Icons';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: 'tenant' as 'landlord' | 'tenant',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        formData.phone.trim(),
        formData.userType,
      );
      navigate(formData.userType === 'landlord' ? '/landlord/dashboard' : '/search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-smooth flex items-center justify-center p-4 py-10">
      <div className="glass-dark-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-700">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
            <IconUser className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white text-center">Create Account</h1>
        <p className="text-xs text-slate-300 text-center mt-1 mb-6">Join Kisumu Rental Marketplace</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 rounded-xl text-xs backdrop-blur">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="John Doe"
            />
          </div>

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
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="+254..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">Account Role</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="tenant" className="bg-slate-900">Tenant (Looking for a place)</option>
              <option value="landlord" className="bg-slate-900">Landlord (Listing properties)</option>
            </select>
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

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3 text-xs">
          <p className="text-slate-400">Already have an account?</p>
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-400 font-bold hover:text-indigo-300 transition"
          >
            Login here
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
