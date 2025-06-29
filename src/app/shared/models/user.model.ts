
export interface User {
  id: string; // UUID
  email: string;
  full_name: string;
  country: string; // e.g. 'US', 'UK'
  city: string;
  auth_provider: string; // e.g. 'local'
}

export interface AuthResponse {
  user: User;
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
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthProvider = 'local' | 'google';
