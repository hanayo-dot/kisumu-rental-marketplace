import type { AuthResponse, RegisterRequest, LoginRequest, Property, Connection } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const propertyService = {
  create: async (data: Partial<Property>): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },

  list: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },

  get: async (id: number): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch property');
    return response.json();
  },

  update: async (id: number, data: Partial<Property>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update property');
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete property');
  },

  search: async (params: {
    area?: string;
    min_price?: number;
    max_price?: number;
    type?: string;
  }): Promise<Property[]> => {
    const queryParams = new URLSearchParams();
    if (params.area) queryParams.append('area', params.area);
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.type) queryParams.append('type', params.type);

    const response = await fetch(`${API_BASE_URL}/properties/search?${queryParams}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },
};

export const connectionService = {
  create: async (propertyId: number): Promise<Connection> => {
    const response = await fetch(`${API_BASE_URL}/connections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ property_id: propertyId }),
    });
    if (!response.ok) throw new Error('Failed to create connection');
    return response.json();
  },

  list: async (userType: 'landlord' | 'tenant'): Promise<Connection[]> => {
    const response = await fetch(`${API_BASE_URL}/connections?user_type=${userType}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch connections');
    return response.json();
  },

  verify: async (connectionId: number, status: string, note?: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/connections/${connectionId}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, landlord_note: note }),
    });
    if (!response.ok) throw new Error('Failed to verify connection');
  },
};
