// api.model.ts

export interface Actor {
  id: string;
  full_name: string;
  photo_url?: string;
  birth_date?: string;
  nationality?: string;
  bio?: string;
}

export interface Movie {
  trailer_url: string;
  rating_count: number;
  runtime_min: number;
  id: string;
  title: string;
  title_tr?: string;
  year: number;
  categories: string[];
  director?: string[];
  writers?: string[];
  summary: string;
  summary_tr?: string;
  imdb_score: number;
  metascore: number;
  image_url: string;
  actors?: Actor[];
  language?: string;
  release_date?: string;
  popularity?: Popularity;
  rating_distribution?: RatingDistributionItem[];
  created_at?: string;
  original_title?: string;
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

export interface Popularity {
  movie_id: string;
  rank: number;
  score: number;
  snapshot_date: string;
}

export interface RatingDistributionItem {
  avg_rating: number;
  country: string;
  votes: number;
}

export type SortOption = 'popularity' | 'rating' | 'year' | 'title';
