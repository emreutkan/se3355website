export interface User {
  id: string;                    // UUID
  email: string;
  full_name: string;
  country?: string;
  city?: string;
  photo_url?: string;
  auth_provider: 'local' | 'google';
  created_at?: string;           // ISO datetime
}

export interface UserStatistics {
  total_ratings: number;
  average_rating: number;
  watchlist_count: number;
  favorite_genres: string[];
}

export interface UserProfile extends User {
  statistics: UserStatistics;
}

// API Request/Response interfaces
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: Pick<User, "id" | "email" | "full_name" | "city" | "country">;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  country: string;
  city: string;
  photo_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  msg: string;
  user: Pick<User, "id" | "email" | "full_name" | "city" | "country">;
}

// Legacy interfaces for backwards compatibility
export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  country: string;
  city: string;
}

export interface RegisterData extends RegisterRequest {}
export interface LoginCredentials extends LoginRequest {}

export type AuthProvider = 'local' | 'google';
