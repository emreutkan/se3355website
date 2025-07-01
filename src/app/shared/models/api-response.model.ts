// api-response.interface.ts - API response models that mirror backend responses

export interface ApiResponse<T> {
  data?: T;
  msg?: string;
  pagination?: PaginationInfo;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Search-specific interfaces
export interface SearchResults {
  query: string;
  type: "all" | "title" | "summary" | "people";
  results: {
    titles: Array<{
      id: string;
      title: string;
      year: number;
      imdb_score: number;
    }>;
    people: Array<{
      id: string;
      full_name: string;
      photo_url?: string;
    }>;
  };
}

export interface TypeaheadSuggestion {
  id: string;
  type: "movie" | "actor";
  title: string;
  year?: number;
  image_url?: string;
}

// Movie-specific response interfaces
export interface MoviesResponse {
  movies: import('./movie.model').Movie[];
  pagination: PaginationInfo;
}

export interface RatingsResponse {
  ratings: import('./movie.model').Rating[];
  distribution: Array<{
    country: string;
    votes: number;
    avg_rating: number;
  }>;
  pagination: PaginationInfo;
}

// User-specific response interfaces
export interface UserRatingsResponse {
  ratings: Array<{
    id: string;
    movie_id: string;
    rating: number;
    comment?: string;
    voter_country: string;
    created_at: string;
    movie: {
      id: string;
      title: string;
      year: number;
      image_url: string;
    };
  }>;
  pagination: PaginationInfo;
}

export interface WatchlistResponse {
  watchlist: Array<{
    movie_id: string;
    added_at: string;
    movie: {
      id: string;
      title: string;
      year: number;
      image_url: string;
      imdb_score: number;
    };
  }>;
  pagination: PaginationInfo;
} 