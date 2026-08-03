import type { AuthResponse, RegisterRequest, LoginRequest, Property, Connection } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse<T>(response: Response, defaultErrorMsg: string): Promise<T> {
  if (!response.ok) {
    let errorMsg = defaultErrorMsg;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch (_) {
      // Ignore JSON parse error on non-ok responses
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response, 'Registration failed');
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response, 'Login failed');
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
    return handleResponse<Property>(response, 'Failed to create property');
  },

  list: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      headers: getHeaders(),
    });
    return handleResponse<Property[]>(response, 'Failed to fetch properties');
  },

  get: async (id: number): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<Property>(response, 'Failed to fetch property');
  },

  update: async (id: number, data: Partial<Property>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    await handleResponse<{ message: string }>(response, 'Failed to update property');
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse<{ message: string }>(response, 'Failed to delete property');
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
    return handleResponse<Property[]>(response, 'Search failed');
  },
};

export const connectionService = {
  create: async (propertyId: number): Promise<Connection> => {
    const response = await fetch(`${API_BASE_URL}/connections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ property_id: propertyId }),
    });
    return handleResponse<Connection>(response, 'Failed to create connection');
  },

  list: async (userType: 'landlord' | 'tenant'): Promise<Connection[]> => {
    const response = await fetch(`${API_BASE_URL}/connections?user_type=${userType}`, {
      headers: getHeaders(),
    });
    return handleResponse<Connection[]>(response, 'Failed to fetch connections');
  },

  verify: async (connectionId: number, status: string, note?: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/connections/${connectionId}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, landlord_note: note }),
    });
    await handleResponse<{ message: string }>(response, 'Failed to verify connection');
  },
};
