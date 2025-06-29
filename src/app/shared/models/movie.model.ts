// api.model.ts

export interface Actor {
  id: string;
  full_name: string;
  photo_url?: string;
  birth_date?: string;
  nationality?: string;
  biography?: string;
}

export interface Movie {
  trailer_url: string;
  rating_count: number;
  runtime_min: number;
  id: string;
  title: string;
  year: number;
  genre: string[];
  director: string[];
  summary: string;
  imdb_score: number;
  image_url: string;
  runtime?: number;
  country?: string;
  language?: string;
  release_date?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at?: string;
}

export interface PopularitySnapshot {
  id: string; // UUID
  movie_id: string;
  snapshot_date: string; // ISO string (date when popularity calculated)
  vote_count: number;
  average_rating: number;
}

export type SortOption = 'popularity' | 'rating' | 'year' | 'title';
