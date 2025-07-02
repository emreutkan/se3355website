import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiUrl } from '../types/api';
import {
  GetActorDetailsResponse,
  GetActorsResponse,
  GetMovieDetailsResponse,
  GetMovieRatingsResponse,
  GetMoviesResponse,
  GetPopularMoviesResponse,
  SearchResponse,
  TypeaheadResponse,
  SubmitRatingResponse
} from '../types/api.responses';
import { Movie, Rating, SortOption, SearchType } from '../models/movie.model';
import { ApiResponse, SearchResults, TypeaheadSuggestion, MoviesResponse, RatingsResponse } from '../models/api-response.model';
import { LanguageService } from './language.service';
import { SubmitRatingRequest } from '../types/api.requests';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private readonly apiUrl =  apiUrl;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('imdb-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ===== MIRROR BACKEND MovieService.search_movies() =====
  searchMovies(query: string, searchType: SearchType = 'all'): Observable<SearchResults> {
    if (!query || query.trim().length < 2) {
      return of({ query: '', type: searchType, results: { titles: [], people: [] } });
    }
    return this.http.get<SearchResults>(`${this.apiUrl}/search`, {
      params: { q: query, type: searchType }
    }).pipe(catchError(this.handleError));
  }

  // ===== MIRROR BACKEND MovieService.get_typeahead_suggestions() =====
  getTypeaheadSuggestions(query: string): Observable<TypeaheadSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }
    return this.http.get<{ suggestions: TypeaheadSuggestion[] }>(`${this.apiUrl}/search/typeahead`, {
      params: { q: query }
    }).pipe(
      map(response => response.suggestions),
      catchError(this.handleError)
    );
  }

  // ===== MIRROR BACKEND movie rating functionality =====
  rateMovie(movieId: string, rating: number, comment?: string): Observable<ApiResponse<Rating>> {
    const ratingData: SubmitRatingRequest = { rating };
    if (comment) {
      ratingData.comment = comment;
    }

    return this.http.post<ApiResponse<Rating>>(`${this.apiUrl}/movies/${movieId}/ratings`, ratingData, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ===== MIRROR BACKEND get movie ratings =====
  getMovieRatings(movieId: string, page: number = 1, size: number = 20): Observable<RatingsResponse> {
    return this.http.get<RatingsResponse>(`${this.apiUrl}/movies/${movieId}/ratings`, {
      params: { page: page.toString(), size: size.toString() }
    }).pipe(catchError(this.handleError));
  }

  // ===== GET USER'S EXISTING RATING FOR A MOVIE =====
  getUserRating(movieId: string): Observable<Rating | null> {
    return this.http.get<{ rating: Rating }>(`${this.apiUrl}/movies/${movieId}/ratings/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.rating),
      catchError(error => {
        // If user hasn't rated this movie, return null instead of error
        if (error.status === 404) {
          return of(null);
        }
        return this.handleError(error);
      })
    );
  }

  // ===== NO BUSINESS LOGIC - just API calls =====
  getMovies(filters: {
    page?: number;
    sort?: SortOption;
    search?: string;
    year?: number;
    minRating?: number;
    size?: number;
  } = {}): Observable<MoviesResponse> {
    const {
      page = 1,
      sort = 'popularity',
      search,
      year,
      minRating,
      size = 20
    } = filters;

    const lang = this.languageService.getCurrentLanguage();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('lang', lang);

    if (search) params = params.set('search', search);
    if (year) params = params.set('year', year.toString());
    if (minRating) params = params.set('min_rating', minRating.toString());

    return this.http.get<MoviesResponse>(`${this.apiUrl}/movies`, { params })
      .pipe(catchError(this.handleError));
  }

  getMovieDetail(movieId: string): Observable<Movie> {
    const headers = this.getAuthHeaders();
    const lang = this.languageService.getCurrentLanguage();
    const params = new HttpParams().set('lang', lang);

    return this.http.get<{ movie: Movie }>(`${this.apiUrl}/movies/${movieId}`, { headers, params })
      .pipe(
        map(response => response.movie),
        catchError(this.handleError)
      );
  }

  getPopularMovies(limit = 10): Observable<GetPopularMoviesResponse> {
    const lang = this.languageService.getCurrentLanguage();
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('lang', lang);

    return this.http.get<GetPopularMoviesResponse>(`${this.apiUrl}/movies/popular`, { params })
      .pipe(catchError(this.handleError));
  }

  // ===== ACTOR ENDPOINTS =====
  getActors(page = 1, search?: string, size = 20): Observable<GetActorsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);

    return this.http.get<GetActorsResponse>(`${this.apiUrl}/actors`, { params })
      .pipe(catchError(this.handleError));
  }

  getActorDetails(id: string): Observable<GetActorDetailsResponse> {
    return this.http.get<GetActorDetailsResponse>(`${this.apiUrl}/actors/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ===== ERROR HANDLING =====
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('MovieService error:', error);
    let msg = 'An unexpected error occurred';

    if (error.status === 0) msg = 'Cannot connect to server.';
    else if (error.status === 400) msg = error.error?.msg || 'Bad request';
    else if (error.status === 401) msg = 'Authentication required';
    else if (error.status === 403) msg = 'Access forbidden';
    else if (error.status === 404) msg = 'Resource not found';
    else if (error.status === 500) msg = 'Server error';
    else if (error.error?.msg) msg = error.error.msg;

    return throwError(() => ({ message: msg, status: error.status, error: error.error }));
  };
}
