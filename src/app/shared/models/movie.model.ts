// movie.interface.ts - Models that exactly mirror backend models

export interface Actor {
  id: string;
  full_name: string;
  photo_url?: string;
  birth_date?: string;
  nationality?: string;
  bio?: string;
}

export interface Movie {
  id: string;                    // UUID
  title: string;
  title_tr?: string;
  original_title?: string;
  year: number;
  summary: string;
  summary_tr?: string;
  imdb_score: number;            // 0.0-10.0
  metascore?: number;
  trailer_url?: string;
  image_url?: string;
  runtime_min?: number;
  release_date?: string;         // ISO date
  language?: string;
  created_at?: string;           // ISO datetime
  actors?: Actor[];
  categories?: string[];
  directors?: string[];
  writers?: string[];
  rating_count?: number;
  popularity?: PopularitySnapshot;
  rating_distribution?: RatingDistributionItem[];
}

export interface Rating {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;                // 1-10
  comment?: string;              // COMMENTS ARE HERE (renamed from review)
  voter_country: string;
  created_at: string;
  updated_at?: string;
  user?: {
    full_name: string;
    country: string;
  };
}

export interface PopularitySnapshot {
  id: string;                    // UUID
  movie_id: string;
  snapshot_date: string;         // ISO string (date when popularity calculated)
  vote_count: number;
  average_rating: number;
  rank?: number;
  score?: number;
}

export interface RatingDistributionItem {
  avg_rating: number;
  country: string;
  votes: number;
}

// Type definitions for API usage
export type SortOption = 'popularity' | 'rating' | 'year' | 'title';
export type SearchType = 'all' | 'title' | 'summary' | 'people';
