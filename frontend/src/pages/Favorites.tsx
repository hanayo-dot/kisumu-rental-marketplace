import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { favoriteService, getFullImageUrl } from '../services/api';
import type { Favorite } from '../types';
import Navbar from '../components/Navbar';
import { IconHeart, IconSearch, IconMapPin } from '../components/Icons';

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadFavorites = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await favoriteService.list();
        setFavorites(data);
      } catch (err) {
        setError('Failed to load favorite properties');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [navigate, user]);

  const handleRemove = async (propertyId: number) => {
    try {
      await favoriteService.remove(propertyId);
      setFavorites((prev) => prev.filter((favorite) => favorite.property_id !== propertyId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove favorite');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-smooth">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-dark-card rounded-3xl p-8 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <IconHeart className="w-5 h-5" filled />
              <span className="text-xs uppercase font-bold tracking-wider">Saved Listings</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Your Saved Favorites</h1>
            <p className="mt-1 text-sm text-slate-300">Keep track of properties you want to revisit and inquire about later.</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <IconSearch className="w-4 h-4" />
            <span>Find More Rentals</span>
          </Link>
        </div>

        {loading ? (
          <div className="glass-dark-card rounded-3xl p-12 text-center text-slate-300">Loading favorites…</div>
        ) : error ? (
          <div className="glass-dark-card rounded-3xl p-8 text-rose-300 border border-rose-500/30">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="glass-dark-card rounded-3xl p-12 text-center text-slate-300">
            You haven't saved any favorites yet. Explore rentals and click the heart icon to save listings.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 border border-slate-700/80">
                {favorite.property?.image_urls && favorite.property.image_urls.length > 0 ? (
                  <img
                    src={getFullImageUrl(favorite.property.image_urls[0])}
                    alt={favorite.property.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="h-52 bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">{favorite.property?.title || 'Property'}</h2>
                      <p className="mt-1 text-xs text-slate-300 flex items-center gap-1">
                        <IconMapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {favorite.property?.address || 'No address'} · {favorite.property?.area || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-indigo-400 font-extrabold text-lg">KSh {favorite.property?.price_per_month?.toLocaleString() || 'N/A'}</span>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      to={`/property/${favorite.property_id}`}
                      className="flex-1 text-center py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemove(favorite.property_id)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-600 hover:text-white transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
