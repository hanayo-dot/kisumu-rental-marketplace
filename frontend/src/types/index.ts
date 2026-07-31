export type UserType = 'landlord' | 'tenant';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  landlord_id: number;
  title: string;
  description: string;
  address: string;
  area: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  property_type: 'house' | 'commercial' | 'apartment';
  price_per_month: number;
  available: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: number;
  tenant_id: number;
  property_id: number;
  landlord_id: number;
  status: 'pending' | 'viewing_scheduled' | 'contacted' | 'successful' | 'rejected' | 'expired';
  landlord_note?: string;
  connection_date: string;
  verified_at?: string;
  payment_status: 'unpaid' | 'pending' | 'paid';
  payment_amount: number;
  created_at: string;
  updated_at: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  property_title?: string;
  landlord_name?: string;
  landlord_phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  user_type: UserType;
}

export interface LoginRequest {
  email: string;
  password: string;
}
