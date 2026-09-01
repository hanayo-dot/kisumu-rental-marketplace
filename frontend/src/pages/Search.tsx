import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService, connectionService, favoriteService, getFullImageUrl } from '../services/api';
import type { Property, Connection } from '../types';
import Navbar from '../components/Navbar';
import { IconSearch, IconHeart, IconBed, IconBath, IconMapPin, IconZap, IconCheck } from '../components/Icons';

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'connections'>('search');

  const [filters, setFilters] = useState({
    area: '',
    minPrice: '',
    maxPrice: '',
    type: '',
  });

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await propertyService.search({});
      setProperties(results);
    } catch (err) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConnections = useCallback(async () => {
    try {
      const data = await connectionService.list('tenant');
      setConnections(data);
    } catch (err) {
      setError('Failed to load connections');
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await favoriteService.list();
      setFavoriteIds(favorites.map((favorite) => favorite.property_id));
    } catch {
      // ignore favorites load failure
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.user_type !== 'tenant') {
      navigate('/landlord/dashboard');
    } else {
      loadInitialData();
      loadConnections();
      loadFavorites();
    }
  }, [user, navigate, loadInitialData, loadConnections, loadFavorites]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const results = await propertyService.search({
        area: filters.area || undefined,
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        type: filters.type || undefined,
      });
      setProperties(results);
    } catch (err) {
      setError('Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (propertyId: number) => {
    try {
      await connectionService.create(propertyId);
      alert('Connection request sent! The landlord will review and respond.');
      loadConnections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send connection request');
    }
  };

  const handlePayConnection = async (connectionId: number) => {
    try {
      await connectionService.pay(connectionId);
      alert('Payment completed successfully.');
      loadConnections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  const handleToggleFavorite = async (propertyId: number) => {
    try {
      await favoriteService.add(propertyId);
      setFavoriteIds((prev) => [...new Set([...prev, propertyId])]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save favorite');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-smooth">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-dark-card rounded-3xl p-8 mb-8">
          <h1 className="text-3xl font-extrabold text-white">Search Rental Homes in Kisumu</h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Filter curated houses, apartments, and commercial spaces across Milimani, Riat Hills, Uzima, and Kisumu Central.
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <IconSearch className="w-4 h-4" />
            <span>Find Properties</span>
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <IconZap className="w-4 h-4" />
            <span>My Inquiries ({connections.length})</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/60 border border-red-500/40 text-red-200 rounded-2xl backdrop-blur-md text-sm">
            {error}
          </div>
        )}

        {activeTab === 'search' && (
          <>
            <div className="glass-dark-card rounded-3xl p-6 mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Filter Properties</h2>
              
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Area</label>
                  <input
                    type="text"
                    placeholder="e.g., Milimani"
                    value={filters.area}
                    onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Min Price (KSh)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Max Price (KSh)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" className="bg-slate-900 text-white">All Types</option>
                    <option value="house" className="bg-slate-900 text-white">House</option>
                    <option value="apartment" className="bg-slate-900 text-white">Apartment</option>
                    <option value="commercial" className="bg-slate-900 text-white">Commercial</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:bg-slate-700"
                  >
                    <IconSearch className="w-4 h-4" />
                    <span>{loading ? 'Searching...' : 'Apply Filter'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.length > 0 ? (
                properties.map((property) => (
                  <div key={property.id} className="glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40">
                    {property.image_urls && property.image_urls.length > 0 ? (
                      <img
                        src={getFullImageUrl(property.image_urls[0])}
                        alt={property.title}
                        className="w-full h-52 object-cover"
                      />
                    ) : (
                      <div className="h-52 bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white">{property.title}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                        <IconMapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {property.address}, {property.area}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 my-4">
                        <span className="flex items-center gap-1">
                          <IconBed className="w-4 h-4 text-slate-400" />
                          {property.bedrooms} Beds
                        </span>
                        <span className="flex items-center gap-1">
                          <IconBath className="w-4 h-4 text-slate-400" />
                          {property.bathrooms} Baths
                        </span>
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                          {property.property_type}
                        </span>
                      </div>

                      <div className="text-2xl font-extrabold text-white mb-4">
                        KSh {property.price_per_month.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/property/${property.id}`}
                          className="flex-1 text-center py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleConnect(property.id)}
                          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(property.id)}
                          disabled={favoriteIds.includes(property.id)}
                          className={`p-2.5 rounded-xl border transition ${
                            favoriteIds.includes(property.id)
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title="Save to favorites"
                        >
                          <IconHeart className="w-4 h-4" filled={favoriteIds.includes(property.id)} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400 glass-dark-card rounded-3xl">
                  {loading ? 'Loading rental listings...' : 'No properties match your filter.'}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'connections' && (
          <div className="glass-dark-card rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Landlord</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {connections.length > 0 ? (
                  connections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {conn.property_title || `Property #${conn.property_id}`}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        <div className="font-semibold text-white">{conn.landlord_name || `Landlord #${conn.landlord_id}`}</div>
                        <div>{conn.landlord_phone}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-3 py-1 rounded-full font-semibold border ${
                          conn.status === 'successful'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : conn.status === 'rejected'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        }`}>
                          {conn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-200">
                        <div>KSh {conn.payment_amount} ({conn.payment_status})</div>
                        {conn.status === 'successful' && conn.payment_status !== 'paid' && (
                          <button
                            onClick={() => handlePayConnection(conn.id)}
                            className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
                          >
                            <IconCheck className="w-3.5 h-3.5" />
                            <span>Pay KSh 150</span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {conn.landlord_note || 'No note added'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      You haven't requested any property connections yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
