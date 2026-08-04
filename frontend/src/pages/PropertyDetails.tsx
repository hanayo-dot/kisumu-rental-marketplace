import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService, connectionService, favoriteService } from '../services/api';
import type { Property } from '../types';
import Navbar from '../components/Navbar';

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
      alert('Connection request sent! The landlord will review and respond to your request.');
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
      alert('Saved to favorites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save favorite');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Property details</h1>
            <p className="mt-2 text-slate-600">Full listing view for this rental offer.</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to search
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-slate-600 shadow-sm">Loading property details…</div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 p-8 text-red-700 shadow-sm">{error}</div>
        ) : property ? (
          <div className="grid gap-8 lg:grid-cols-[2.2fr_1fr] motion-safe:animate-fade-in">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl bg-white shadow-lg motion-safe:animate-pop-in">
                {property.image_urls && property.image_urls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {property.image_urls.map((image, idx) => (
                      <img key={idx} src={image} alt={`${property.title} ${idx + 1}`} className="h-72 w-full object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="h-72 bg-slate-200 p-8 text-center text-slate-500">No images available</div>
                )}
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{property.title}</h2>
                    <p className="mt-2 text-slate-600">{property.address}, {property.area}</p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600">KSh. {property.price_per_month.toLocaleString()}/mo</p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Bedrooms</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Bathrooms</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Type</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{property.property_type}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 text-slate-600">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">About this property</h3>
                    <p className="mt-3 leading-7">{property.description || 'A clean and comfortable home in Kisumu.'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
                    <p className="mt-3 text-slate-700">{property.available ? 'Available now' : 'Currently unavailable'}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900">Tenant actions</h3>
                <p className="mt-3 text-slate-600">Request a connection, book a viewing, and stay in touch with the landlord.</p>
                {user?.user_type === 'tenant' ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleConnect}
                      disabled={requesting || !property.available}
                      className="mt-6 w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-400"
                    >
                      {requesting ? 'Requesting...' : property.available ? 'Request Connection' : 'Not Available'}
                    </button>
                    <button
                      onClick={handleSaveFavorite}
                      disabled={saved}
                      className={`w-full rounded-full px-5 py-3 text-sm font-semibold ${saved ? 'bg-slate-300 text-slate-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                    >
                      {saved ? 'Saved' : 'Save to Favorites'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                    Landlords can manage tenant inquiries from the dashboard.
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
