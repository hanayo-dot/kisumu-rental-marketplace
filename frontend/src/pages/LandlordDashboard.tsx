import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService, connectionService } from '../services/api';
import type { Property, Connection } from '../types';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'properties' | 'connections'>('properties');

  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    title: '',
    description: '',
    address: '',
    area: 'Kisumu Central',
    bedrooms: 0,
    bathrooms: 0,
    property_type: 'house',
    price_per_month: 0,
    image_urls: [],
  });
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.user_type !== 'landlord') {
      navigate('/search');
    } else {
      loadProperties();
      loadConnections();
    }
  }, [user, navigate]);

  const loadProperties = async () => {
    try {
      const data = await propertyService.list();
      setProperties(data);
    } catch (err) {
      setError('Failed to load properties');
    }
  };

  const loadConnections = async () => {
    try {
      const data = await connectionService.list('landlord');
      setConnections(data);
    } catch (err) {
      setError('Failed to load connections');
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await propertyService.create(newProperty);
      setNewProperty({
        title: '',
        description: '',
        address: '',
        area: 'Kisumu Central',
        bedrooms: 0,
        bathrooms: 0,
        property_type: 'house',
        price_per_month: 0,
        image_urls: [],
      });
      setImageUrlInput('');
      alert('Property listed successfully!');
      loadProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyConnection = async (connectionId: number, status: string) => {
    const note = prompt('Add a note (optional):');
    try {
      await connectionService.verify(connectionId, status, note || '');
      alert('Connection verified!');
      loadConnections();
    } catch (err) {
      alert('Failed to verify connection');
    }
  };

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const handleDeleteProperty = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await propertyService.delete(id);
      loadProperties();
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setLoading(true);
    setError('');

    try {
      await propertyService.update(editingProperty.id, editingProperty);
      setEditingProperty(null);
      alert('Property updated successfully!');
      loadProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Landlord Dashboard</h1>
          <div className="space-x-4">
            <span className="text-gray-700">Welcome, {user?.full_name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'properties'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Properties
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Tenant Inquiries ({connections.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Modal for Editing Property */}
        {editingProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Property</h2>
              <form onSubmit={handleUpdateProperty} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editingProperty.title}
                    onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={editingProperty.address}
                    onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (KSh/mo)</label>
                    <input
                      type="number"
                      value={editingProperty.price_per_month}
                      onChange={(e) => setEditingProperty({ ...editingProperty, price_per_month: parseFloat(e.target.value) })}
                      required
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Available</label>
                    <select
                      value={editingProperty.available ? 'true' : 'false'}
                      onChange={(e) => setEditingProperty({ ...editingProperty, available: e.target.value === 'true' })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">List a New Property</h2>
              <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Beautiful 2-bedroom house"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Area</label>
                  <select
                    value={newProperty.area}
                    onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kisumu Central">Kisumu Central</option>
                    <option value="Nyalenda">Nyalenda</option>
                    <option value="Milimani">Milimani</option>
                    <option value="Uzima">Uzima</option>
                    <option value="Oasis">Oasis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (KSh/month)</label>
                  <input
                    type="number"
                    value={newProperty.price_per_month}
                    onChange={(e) => setNewProperty({ ...newProperty, price_per_month: parseFloat(e.target.value) })}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    value={newProperty.bedrooms}
                    onChange={(e) => setNewProperty({ ...newProperty, bedrooms: parseInt(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    value={newProperty.bathrooms}
                    onChange={(e) => setNewProperty({ ...newProperty, bathrooms: parseInt(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newProperty.property_type}
                    onChange={(e) => setNewProperty({ ...newProperty, property_type: e.target.value as 'house' | 'apartment' | 'commercial' })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!imageUrlInput) return;
                        const nextImages = [...(newProperty.image_urls || []), imageUrlInput];
                        setNewProperty({ ...newProperty, image_urls: nextImages });
                        setImageUrlInput('');
                      }}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      Add
                    </button>
                  </div>
                  {newProperty.image_urls && newProperty.image_urls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {newProperty.image_urls.map((url, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                          <img src={url} alt={`Property ${index + 1}`} className="h-24 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="md:col-span-2 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {loading ? 'Adding Property...' : 'List Property (First free, then KSh.250)'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.length > 0 ? (
                properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {property.image_urls && property.image_urls.length > 0 && (
                      <img
                        src={property.image_urls[0]}
                        alt={property.title}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                      <p className="text-gray-600 text-sm">{property.address}</p>
                      <p className="text-gray-600 text-sm">{property.area}</p>
                      
                      <div className="flex justify-between text-sm text-gray-700 my-2">
                        <span>{property.bedrooms} Beds</span>
                        <span>{property.bathrooms} Baths</span>
                      </div>

                      <div className="text-lg font-bold text-indigo-600 mb-3">
                        KSh. {property.price_per_month.toLocaleString()}/mo
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProperty(property)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No properties listed yet. Add your first property above!
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tenant Info</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {connections.length > 0 ? (
                  connections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-semibold">{conn.tenant_name || `Tenant #${conn.tenant_id}`}</div>
                        <div className="text-xs text-gray-500">{conn.tenant_phone && `Phone: ${conn.tenant_phone}`}</div>
                        <div className="text-xs text-gray-500">{conn.tenant_email && `Email: ${conn.tenant_email}`}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {conn.property_title || `Property #${conn.property_id}`}
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
                        {conn.landlord_note && (
                          <div className="text-xs text-gray-500 mt-1">Note: {conn.landlord_note}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        KSh. {conn.payment_amount} ({conn.payment_status})
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {conn.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyConnection(conn.id, 'viewing_scheduled')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Schedule Viewing
                            </button>
                            <button
                              onClick={() => handleVerifyConnection(conn.id, 'rejected')}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {conn.status === 'viewing_scheduled' && (
                          <button
                            onClick={() => handleVerifyConnection(conn.id, 'successful')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Mark Successful
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No tenant inquiries yet.
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
