import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService, connectionService, favoriteService, getFullImageUrl } from '../services/api';
import type { Property } from '../types';
import Navbar from '../components/Navbar';
import { IconBed, IconBath, IconMapPin, IconHeart, IconChevronLeft } from '../components/Icons';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await propertyService.get(parseInt(id, 10));
        setProperty(data);
      } catch (err) {
        setError('Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate, user]);

  const handleConnect = async () => {
    if (!property) return;
    setRequesting(true);
    setError('');
    try {
      await connectionService.create(property.id);
      alert('Connection request sent! The landlord will review and respond.');
      navigate('/search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request connection');
    } finally {
      setRequesting(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!property) return;
    try {
      await favoriteService.add(property.id);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save favorite');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-smooth">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Property Overview</h1>
            <p className="mt-1 text-sm text-slate-300">Complete listing details and connection features.</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <IconChevronLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </Link>
        </div>

        {loading ? (
          <div className="glass-dark-card rounded-3xl p-12 text-center text-slate-300">Loading property details…</div>
        ) : error ? (
          <div className="glass-dark-card rounded-3xl p-8 text-rose-300 border border-rose-500/30">{error}</div>
        ) : property ? (
          <div className="grid gap-8 lg:grid-cols-[2.2fr_1fr] animate-fade-in">
            <div className="space-y-6">
              <div className="glass-dark-card rounded-3xl overflow-hidden shadow-2xl p-2">
                {property.image_urls && property.image_urls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {property.image_urls.map((image, idx) => (
                      <img
                        key={idx}
                        src={getFullImageUrl(image)}
                        alt={`${property.title} ${idx + 1}`}
                        className="h-72 w-full object-cover rounded-2xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-72 bg-slate-900/60 rounded-2xl flex items-center justify-center text-slate-500">No Image Available</div>
                )}
              </div>

              <div className="glass-dark-card rounded-3xl p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">{property.title}</h2>
                    <p className="mt-1 text-xs text-slate-300 flex items-center gap-1">
                      <IconMapPin className="w-4 h-4 text-indigo-400" />
                      {property.address}, {property.area}
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold text-white">
                    KSh {property.price_per_month.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="glass-card rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bedrooms</p>
                    <p className="mt-2 text-xl font-bold text-white flex items-center gap-2">
                      <IconBed className="w-5 h-5 text-indigo-400" />
                      {property.bedrooms || 'N/A'}
                    </p>
                  </div>
                  <div className="glass-card rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bathrooms</p>
                    <p className="mt-2 text-xl font-bold text-white flex items-center gap-2">
                      <IconBath className="w-5 h-5 text-indigo-400" />
                      {property.bathrooms || 'N/A'}
                    </p>
                  </div>
                  <div className="glass-card rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Type</p>
                    <p className="mt-2 text-xl font-bold text-white capitalize">{property.property_type}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-6 text-slate-300">
                  <div>
                    <h3 className="text-lg font-bold text-white">About this property</h3>
                    <p className="mt-2 text-sm leading-relaxed">{property.description || 'A clean and comfortable home in Kisumu.'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Availability</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {property.available ? (
                        <span className="text-emerald-400 font-semibold">Available Now</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">Currently Unavailable</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="glass-dark-card rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white">Tenant Actions</h3>
                <p className="mt-2 text-xs text-slate-300">Send an official connection request to inspect this property and connect with the landlord.</p>
                {user?.user_type === 'tenant' ? (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleConnect}
                      disabled={requesting || !property.available}
                      className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      {requesting ? 'Sending Request...' : property.available ? 'Request Connection' : 'Unavailable'}
                    </button>
                    <button
                      onClick={handleSaveFavorite}
                      disabled={saved}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition border ${
                        saved
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <IconHeart className="w-4 h-4" filled={saved} />
                      <span>{saved ? 'Saved to Favorites' : 'Save to Favorites'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-slate-900/60 p-4 text-xs text-slate-400 border border-slate-800">
                    Landlords can manage tenant connection inquiries from their dashboard.
                  </div>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
