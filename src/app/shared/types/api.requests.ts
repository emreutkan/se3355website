// api.requests.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  country: string;
  city: string;
  photo_url?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  city?: string;
  country?: string;
  photo_url?: string;
}

export interface CreateMovieRequest {
  title: string;
  original_title?: string;
  summary: string;
  year: number;
  runtime_min?: number;
  language?: string;
  release_date?: string;
  image_url?: string;
  trailer_url?: string;
}

export interface SubmitRatingRequest {
  rating: number;
  comment?: string;
}
