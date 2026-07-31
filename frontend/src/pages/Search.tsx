import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService, connectionService } from '../services/api';
import type { Property, Connection } from '../types';

export default function Search() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
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
    }
  }, [user, navigate, loadInitialData, loadConnections]);

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
      alert('Connection request sent! The landlord will review and respond to your request.');
      loadConnections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send connection request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Kisumu Rentals</h1>
          <div className="space-x-4">
            <span className="text-gray-700">Welcome, {user?.full_name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Find Properties
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Inquiries ({connections.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {activeTab === 'search' && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Search Properties in Kisumu</h2>
              
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area</label>
                  <input
                    type="text"
                    placeholder="e.g., Kisumu Central"
                    value={filters.area}
                    onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Price (KSh)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Price (KSh)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.length > 0 ? (
                properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                    {property.image_urls && property.image_urls.length > 0 && (
                      <img
                        src={property.image_urls[0]}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                      <p className="text-gray-600 text-sm">{property.address}</p>
                      <p className="text-gray-600 text-sm mb-2">{property.area}</p>
                      
                      <div className="flex justify-between text-sm text-gray-700 mb-3">
                        <span>{property.bedrooms} Beds</span>
                        <span>{property.bathrooms} Baths</span>
                        <span className="capitalize">{property.property_type}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-indigo-600">
                          KSh. {property.price_per_month.toLocaleString()}/mo
                        </span>
                        <button
                          onClick={() => handleConnect(property.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-semibold"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {loading ? 'Loading properties...' : 'No properties found. Try adjusting your search.'}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'connections' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Landlord Info</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Landlord Note</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {connections.length > 0 ? (
                  connections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {conn.property_title || `Property #${conn.property_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-semibold">{conn.landlord_name || `Landlord #${conn.landlord_id}`}</div>
                        <div className="text-xs text-gray-500">{conn.landlord_phone && `Phone: ${conn.landlord_phone}`}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          conn.status === 'successful'
                            ? 'bg-green-100 text-green-800'
                            : conn.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {conn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {conn.landlord_note || 'No note added'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
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
