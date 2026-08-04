import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { favoriteService } from '../services/api';
import type { Favorite } from '../types';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Saved Favorites</h1>
            <p className="mt-2 text-slate-600">Keep track of properties you want to revisit later.</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Find more rentals
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-slate-600 shadow-sm">Loading favorites…</div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 p-8 text-red-700 shadow-sm">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center text-slate-600 shadow-sm">
            You haven't saved any favorites yet. Explore rentals and add the ones you love.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="rounded-3xl bg-white shadow hover:shadow-lg transition duration-300">
                {favorite.property?.image_urls && favorite.property.image_urls.length > 0 ? (
                  <img
                    src={favorite.property.image_urls[0]}
                    alt={favorite.property.title}
                    className="h-56 w-full object-cover rounded-t-3xl"
                  />
                ) : (
                  <div className="h-56 bg-slate-200 rounded-t-3xl"></div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{favorite.property?.title || 'Property'}</h2>
                      <p className="mt-2 text-sm text-slate-600">{favorite.property?.address || 'No address'} · {favorite.property?.area || 'Unknown'}</p>
                    </div>
                    <span className="text-indigo-600 font-bold">KSh. {favorite.property?.price_per_month?.toLocaleString() || 'N/A'}/mo</span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      to={`/property/${favorite.property_id}`}
                      className="inline-flex items-center justify-center rounded-full border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                    >
                      View details
                    </Link>
                    <button
                      onClick={() => handleRemove(favorite.property_id)}
                      className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
