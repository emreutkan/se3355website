// api.responses.ts


import {Actor, Movie, Rating} from '../models/movie.model';
import {User} from '../models/user.model';

export interface PaginationMeta {
  page: number;
  pages: number;
  size: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

/* -------------------- ACTORS -------------------- */

export interface GetActorsResponse {
  actors: Actor[];
  pagination: PaginationMeta;
}

export interface GetActorDetailsResponse {
  actor: Actor & {
    movies: Pick<Movie, "id" | "title" | "year" | "image_url" | "imdb_score">[];
  };
}

/* -------------------- MOVIES -------------------- */

export interface GetMoviesResponse {
  movies: Movie[];
  pagination: PaginationMeta;
}

export interface GetMovieDetailsResponse {
  movie: Movie & {
    rating_distribution: Record<number, number>; // e.g. { 1: 2, 2: 3, ..., 10: 15 }
    popularity?: {
      score: number;
      snapshot_date: string;
    };
  };
}

export interface GetPopularMoviesResponse {
  popular_movies: (Movie & {
    popularity: {
      score: number;
      search_count: number;
      views_count: number;
      snapshot_date: string;
    }
  })[];
}

/* -------------------- RATINGS -------------------- */

export interface GetMovieRatingsResponse {
  ratings: (Rating & {
    user: Pick<User, "id" | "full_name" | "country">
  })[];
  pagination: PaginationMeta;
  distribution: {
    [rating: number]: number;
    country_breakdown: Record<string, number>;
  };
}

/* -------------------- USER PROFILE & WATCHLIST -------------------- */

export interface GetUserProfileResponse {
  profile: User & {
    statistics: {
      average_rating: number;
      favorite_genres: string[];
      total_ratings: number;
      watchlist_count: number;
    }
  };
}

export interface GetUserRatingsResponse {
  ratings: {
    id: string;
    created_at: string;
    rating: number;
    review?: string;
    movie: Pick<Movie, "id" | "title" | "year" | "image_url">
  }[];
  pagination: PaginationMeta;
}

export interface GetUserWatchlistResponse {
  watchlist: {
    movie_id: string;
    added_at: string;
    movie: Pick<Movie, "id" | "title" | "year" | "image_url" | "imdb_score">;
  }[];
  pagination: PaginationMeta;
}

/* -------------------- AUTH -------------------- */

export interface AuthLoginResponse {
  access_token: string;
  refresh_token: string;
  user: Pick<User, "id" | "email" | "full_name" | "city" | "country">
}

export interface AuthMeResponse {
  user: User;
}

export interface AuthRefreshResponse {
  access_token: string;
}

export interface AuthLogoutResponse {
  msg: string;
}

export interface AuthRegisterResponse {
  msg: string;
  user: Pick<User, "id" | "email" | "full_name" | "city" | "country">
}

/* -------------------- SEARCH -------------------- */

export interface SearchResponse {
  query: string;
  type: "all" | "title" | "summary" | "people";
  results: {
    titles: Pick<Movie, "id" | "title" | "year" | "imdb_score">[];
    people: Pick<Actor, "id" | "full_name" | "photo_url">[];
  };
}

export interface TypeaheadResponse {
  query: string;
  suggestions: {
    id: string;
    type: "movie" | "actor";
    title: string;
    year?: number;
    image_url?: string;
  }[];
}
