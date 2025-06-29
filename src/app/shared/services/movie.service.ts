import { Injectable } from '@angular/core';
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
  GetPopularMoviesResponse, GetUserRatingsResponse, GetUserWatchlistResponse, SearchResponse, TypeaheadResponse
} from '../types/api.responses';
import {SortOption} from '../models/movie.model';


@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly apiUrl = 'http://localhost:5000/api'; // Updated to port 5000

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('imdb-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ================== MOVIES ==================

  getPopularMovies(limit: number = 10): Observable<GetPopularMoviesResponse> {
    return this.http.get<GetPopularMoviesResponse>(`${apiUrl}/movies/popular?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getMovies(
    page: number = 1,
    sort: SortOption = 'popularity',
    search?: string,
    year?: number,
    minRating?: number,
    size: number = 20
  ): Observable<GetMoviesResponse> {
    let params = `page=${page}&size=${size}&sort=${sort}`;
    if (search) params += `&search=${encodeURIComponent(search)}`;
    if (year) params += `&year=${year}`;
    if (minRating) params += `&min_rating=${minRating}`;

    return this.http.get<GetMoviesResponse>(`${apiUrl}/movies?${params}`)
      .pipe(catchError(this.handleError));
  }

  getMovieDetails(id: string): Observable<GetMovieDetailsResponse> {
    return this.http.get<GetMovieDetailsResponse>(`${apiUrl}/movies/${id}`);
  }

  getMovieRatings(movieId: string, page: number = 1, size: number = 20): Observable<GetMovieRatingsResponse> {
    return this.http.get<GetMovieRatingsResponse>(`${apiUrl}/movies/${movieId}/ratings?page=${page}&size=${size}`)
      .pipe(catchError(this.handleError));
  }



  // ================== ACTORS ==================

  getActors(page: number = 1, search?: string, size: number = 20): Observable<GetActorsResponse> {
    let params = `page=${page}&size=${size}`;
    if (search) params += `&search=${encodeURIComponent(search)}`;
    return this.http.get<GetActorsResponse>(`${apiUrl}/actors?${params}`)
      .pipe(catchError(this.handleError));
  }

  getActorDetails(id: string): Observable<GetActorDetailsResponse> {
    return this.http.get<GetActorDetailsResponse>(`${apiUrl}/actors/${id}`);
  }

  // ================== USER ==================

  getUserRatings(page: number = 1, size: number = 20): Observable<GetUserRatingsResponse> {
    return this.http.get<GetUserRatingsResponse>(`${apiUrl}/users/me/ratings?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  getWatchlist(page: number = 1, size: number = 20): Observable<GetUserWatchlistResponse> {
    return this.http.get<GetUserWatchlistResponse>(`${apiUrl}/users/me/watchlist?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  toggleWatchlist(movieId: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${apiUrl}/users/me/watchlist/${movieId}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ================== SEARCH ==================

  search(query: string, type: 'all' | 'title' | 'summary' | 'people' = 'all'): Observable<SearchResponse> {
    if (!query || query.trim().length < 2) {
      return of({ query: '', type, results: { titles: [], people: [] } });
    }
    return this.http.get<SearchResponse>(`${apiUrl}/search?q=${encodeURIComponent(query)}&type=${type}`)
      .pipe(catchError(this.handleError));
  }

  searchTypeahead(query: string): Observable<TypeaheadResponse> {
    if (!query || query.trim().length < 3) {
      return of({ query: '', suggestions: [] });
    }
    return this.http.get<TypeaheadResponse>(`${apiUrl}/search/typeahead?q=${encodeURIComponent(query)}`)
      .pipe(catchError(this.handleError));
  }

  // ================== HELPERS ==================

  isAuthenticated(): boolean {
    return !!localStorage.getItem('imdb-token');
  }

  validateRating(rating: number): boolean {
    return rating >= 1 && rating <= 10 && Number.isInteger(rating);
  }

  convertRatingScale(value: number, fromScale: number = 5, toScale: number = 10): number {
    return Math.round((value / fromScale) * toScale);
  }

  formatRating(value: number): string {
    return value.toFixed(1);
  }

  formatRuntime(minutes: number): string {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  formatReleaseDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getImageUrl(url: string): string {
    return url || '/assets/images/no-image.png';
  }

  // ================== ERRORS ==================

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      switch (error.status) {
        case 400: message = error.error?.msg || 'Bad request'; break;
        case 401: message = 'Authentication required'; break;
        case 403: message = 'Access forbidden'; break;
        case 404: message = error.error?.msg || 'Not found'; break;
        case 500: message = 'Server error'; break;
        default: message = error.error?.msg || `Error ${error.status}`;
      }
    }
    console.error('API Error:', error);
    return throwError(() => new Error(message));
  };

  getPosterUrl(imageUrl: string): string {
    return this.getImageUrl(imageUrl);
  }
}
