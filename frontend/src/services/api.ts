import type { AuthResponse, RegisterRequest, LoginRequest, Property, Connection } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  const isJson = response.headers.get('content-type')?.includes('application/json');

  if (!response.ok) {
    let errorMessage = response.statusText || 'Request failed';
    if (text) {
      try {
        const data = isJson ? JSON.parse(text) : null;
        if (data?.error) errorMessage = data.error;
        else if (data?.message) errorMessage = data.message;
        else if (data) errorMessage = JSON.stringify(data);
        else errorMessage = text;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage || 'Request failed');
  }

  if (!text) {
    return null as T;
  }

  return isJson ? (JSON.parse(text) as T) : (text as unknown as T);
};

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse<AuthResponse>(response);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse<AuthResponse>(response);
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
    await parseResponse<void>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await parseResponse<void>(response);
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
    return parseResponse<Property[]>(response);
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
    return parseResponse<Connection[]>(response);
  },

  verify: async (connectionId: number, status: string, note?: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/connections/${connectionId}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, landlord_note: note }),
    });
    await parseResponse<void>(response);
  },
};
