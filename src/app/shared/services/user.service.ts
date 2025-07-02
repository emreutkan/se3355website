import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiUrl } from '../types/api';
import { GetUserProfileResponse, GetUserRatingsResponse } from '../types/api.responses';
import { UserProfile, UserStatistics } from '../models/user.model';
import { ApiResponse, UserRatingsResponse, WatchlistResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

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

  // ===== MIRROR BACKEND UserService.get_user_statistics() =====
  getUserStatistics(): Observable<UserStatistics> {
    return this.getUserProfile().pipe(
      map(response => response.profile.statistics),
      catchError(this.handleError)
    );
  }

  // ===== MIRROR BACKEND UserService profile methods =====
  getUserProfile(): Observable<{profile: UserProfile}> {
    return this.http.get<GetUserProfileResponse>(`${apiUrl}/users/me/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateUserProfile(profileData: any): Observable<{profile: UserProfile, msg: string}> {
    return this.http.put<{profile: UserProfile, msg: string}>(`${apiUrl}/users/me/profile`, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ===== MIRROR BACKEND user ratings endpoint =====
  getUserRatings(page: number = 1, size: number = 20): Observable<UserRatingsResponse> {
    return this.http.get<UserRatingsResponse>(`${apiUrl}/users/me/ratings`, {
      headers: this.getAuthHeaders(),
      params: { page: page.toString(), size: size.toString() }
    }).pipe(catchError(this.handleError));
  }

  // ===== MIRROR BACKEND watchlist functionality =====
  toggleWatchlist(movieId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${apiUrl}/users/me/watchlist/${movieId}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  getUserWatchlist(page: number = 1, size: number = 20): Observable<WatchlistResponse> {
    return this.http.get<WatchlistResponse>(`${apiUrl}/users/me/watchlist`, {
      headers: this.getAuthHeaders(),
      params: { page: page.toString(), size: size.toString() }
    }).pipe(catchError(this.handleError));
  }

  // ===== VALIDATION & AUTHENTICATION =====
  isAuthenticated(): boolean {
    return !!localStorage.getItem('imdb-token');
  }

  // ===== ERROR HANDLING =====
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('UserService error:', error);
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
