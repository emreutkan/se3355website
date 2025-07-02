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
      rank: number;
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
  ratings: {
    id: string;
    user: {
      full_name: string;
      country: string;
    };
    rating: number;
    comment?: string;
    voter_country: string;
    created_at: string;
  }[];
  distribution: {
    country: string;
    votes: number;
    avg_rating: number;
  }[];
  pagination: PaginationMeta;
}

export interface SubmitRatingResponse {
  msg: string;
  rating: {
    id: string;
    user_id: string;
    movie_id: string;
    rating: number;
    comment?: string;
    voter_country: string;
    created_at: string;
  };
}

/* -------------------- USER PROFILE & WATCHLIST -------------------- */

export interface GetUserProfileResponse {
  profile: User & {
    statistics: {
      average_rating_given: number;
      favorite_genres: string[];
      ratings_count: number;
      watchlist_count: number;
    }
  };
}

export interface GetUserRatingsResponse {
  ratings: {
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
