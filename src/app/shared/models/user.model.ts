export interface User {
  id: string; // UUID
  email: string;
  full_name: string;
  country: string; // e.g. 'US', 'UK'
  city: string;
  photo_url?: string;
  auth_provider?: 'local' | 'google';
  created_at?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  country: string;
  city: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  country: string;
  city: string;
  photo_url?: string;
}

export interface RegisterResponse {
  msg: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthProvider = 'local' | 'google';
