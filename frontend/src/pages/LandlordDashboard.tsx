import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService, connectionService, uploadService, getFullImageUrl } from '../services/api';
import type { Property, Connection } from '../types';
import Navbar from '../components/Navbar';
import { IconDashboard, IconHome, IconBed, IconBath, IconMapPin, IconCheck, IconZap } from '../components/Icons';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    available: true,
    status: 'available',
    image_urls: [],
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

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
        available: true,
        status: 'available',
        image_urls: [],
      });
      setPreviewImages([]);
      alert('Property listed successfully!');
      loadProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError('');

    try {
      const uploadedUrls = await uploadService.uploadImages(files);
      const existing = newProperty.image_urls || [];
      setNewProperty((prev) => ({ ...prev, image_urls: [...existing, ...uploadedUrls] }));
      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload selected photos');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVerifyConnection = async (connectionId: number, status: string) => {
    const note = prompt('Add a note (optional):');
    try {
      await connectionService.verify(connectionId, status, note || '');
      alert('Connection status updated!');
      loadConnections();
    } catch (err) {
      alert('Failed to verify connection');
    }
  };

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
    <div className="min-h-screen text-slate-100 font-smooth">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-dark-card rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <IconDashboard className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Landlord Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Property Listing & Connections Dashboard</h1>
          <p className="mt-1 text-sm text-slate-300">
            List new rental homes (1st listing free, KSh 250 for extra listings) and verify tenant inquiries.
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'properties'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <IconHome className="w-4 h-4" />
            <span>My Properties ({properties.length})</span>
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
            <span>Tenant Inquiries ({connections.length})</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/40 text-rose-200 rounded-2xl text-sm backdrop-blur">
            {error}
          </div>
        )}

        {/* Modal for Editing Property */}
        {editingProperty && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-dark-card rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Edit Property Listing</h2>
              <form onSubmit={handleUpdateProperty} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProperty.title}
                    onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Address</label>
                  <input
                    type="text"
                    value={editingProperty.address}
                    onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Price (KSh/mo)</label>
                    <input
                      type="number"
                      value={editingProperty.price_per_month}
                      onChange={(e) => setEditingProperty({ ...editingProperty, price_per_month: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Available</label>
                    <select
                      value={editingProperty.available ? 'true' : 'false'}
                      onChange={(e) => setEditingProperty({ ...editingProperty, available: e.target.value === 'true' })}
                      className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="true" className="bg-slate-900">Yes</option>
                      <option value="false" className="bg-slate-900">No</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-semibold shadow"
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
            <div className="glass-dark-card rounded-3xl p-8 mb-8">
              <h2 className="text-xl font-extrabold text-white mb-6">List a New Property</h2>
              <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Title</label>
                  <input
                    type="text"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Modern 3-Bedroom Villa in Milimani"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Area</label>
                  <select
                    value={newProperty.area}
                    onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Milimani" className="bg-slate-900">Milimani</option>
                    <option value="Riat Hills" className="bg-slate-900">Riat Hills</option>
                    <option value="Kisumu Central" className="bg-slate-900">Kisumu Central</option>
                    <option value="Uzima" className="bg-slate-900">Uzima</option>
                    <option value="Nyalenda" className="bg-slate-900">Nyalenda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Address</label>
                  <input
                    type="text"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 12 Palms Drive"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Price (KSh/month)</label>
                  <input
                    type="number"
                    value={newProperty.price_per_month}
                    onChange={(e) => setNewProperty({ ...newProperty, price_per_month: parseFloat(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="35000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={newProperty.bedrooms}
                    onChange={(e) => setNewProperty({ ...newProperty, bedrooms: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={newProperty.bathrooms}
                    onChange={(e) => setNewProperty({ ...newProperty, bathrooms: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={newProperty.property_type}
                    onChange={(e) => setNewProperty({ ...newProperty, property_type: e.target.value as 'house' | 'apartment' | 'commercial' })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="house" className="bg-slate-900">House</option>
                    <option value="apartment" className="bg-slate-900">Apartment</option>
                    <option value="commercial" className="bg-slate-900">Commercial</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                    rows={3}
                    placeholder="Provide property details for tenants"
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Property Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImage}
                    onChange={(e) => handleImageSelect(e.target.files)}
                    className="w-full text-xs text-slate-300 bg-slate-950/60 border border-slate-700/80 rounded-xl p-2.5"
                  />
                  {uploadingImage && <p className="mt-1.5 text-xs text-indigo-400 font-semibold">Uploading photo assets to server...</p>}
                  {previewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {previewImages.map((src, index) => (
                        <div key={index} className="overflow-hidden rounded-2xl border border-slate-700">
                          <img src={getFullImageUrl(src)} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="md:col-span-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:bg-slate-800 text-sm"
                >
                  {loading ? 'Adding Property Listing...' : 'Publish Property (1st Free, then KSh.250)'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.length > 0 ? (
                properties.map((property) => (
                  <div key={property.id} className="glass-card rounded-3xl overflow-hidden border border-slate-700/80 transition-all hover:-translate-y-1">
                    {property.image_urls && property.image_urls.length > 0 && (
                      <img
                        src={getFullImageUrl(property.image_urls[0])}
                        alt={property.title}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white">{property.title}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                        <IconMapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {property.address}, {property.area}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 my-3">
                        <span className="flex items-center gap-1">
                          <IconBed className="w-4 h-4 text-slate-400" />
                          {property.bedrooms} Beds
                        </span>
                        <span className="flex items-center gap-1">
                          <IconBath className="w-4 h-4 text-slate-400" />
                          {property.bathrooms} Baths
                        </span>
                      </div>

                      <div className="text-xl font-extrabold text-white mb-4">
                        KSh {property.price_per_month.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProperty(property)}
                          className="flex-1 py-2 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 py-2 bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold hover:bg-rose-600 hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400 glass-dark-card rounded-3xl">
                  No property listings published yet. Fill out the form above to add your first property!
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Tenant Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {connections.length > 0 ? (
                  connections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 text-xs text-slate-200">
                        <div className="font-bold text-white text-sm">{conn.tenant_name || `Tenant #${conn.tenant_id}`}</div>
                        <div>{conn.tenant_phone}</div>
                        <div className="text-slate-400">{conn.tenant_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {conn.property_title || `Property #${conn.property_id}`}
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
                        {conn.landlord_note && (
                          <div className="text-xs text-slate-400 mt-1">Note: {conn.landlord_note}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-200">
                        KSh {conn.payment_amount} ({conn.payment_status})
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {conn.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyConnection(conn.id, 'viewing_scheduled')}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500 transition"
                            >
                              Schedule Viewing
                            </button>
                            <button
                              onClick={() => handleVerifyConnection(conn.id, 'rejected')}
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-500 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {conn.status === 'viewing_scheduled' && (
                          <button
                            onClick={() => handleVerifyConnection(conn.id, 'successful')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500 transition flex items-center gap-1"
                          >
                            <IconCheck className="w-3.5 h-3.5" />
                            <span>Mark Successful</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No tenant connection inquiries received yet.
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
