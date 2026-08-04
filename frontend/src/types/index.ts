export type UserType = 'landlord' | 'tenant';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  user_type: UserType;
  profile_picture: string;
  bio: string;
  languages: string;
  preferred_locations: string;
  preferred_property_types: string;
  move_in_date?: string;
  pets: string;
  smoking_preference: string;
  rental_history: string;
  references: string;
  verification_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  verification_badge: boolean;
  profile_completed: boolean;
  joined_date: string;
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
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  property_type: 'house' | 'commercial' | 'apartment';
  price_per_month: number;
  available: boolean;
  status: 'available' | 'occupied' | 'reserved';
  parking: boolean;
  furnished: boolean;
  pet_friendly: boolean;
  internet: boolean;
  water: boolean;
  electricity: boolean;
  security_features: string;
  nearby_schools: string;
  nearby_hospitals: string;
  nearby_shopping: string;
  nearby_transport: string;
  available_date?: string;
  property_rules: string;
  image_urls: string[];
  video_urls: string[];
  floor_plan_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  property_id: number;
  property?: Property;
  created_at: string;
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
