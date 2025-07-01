import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { apiUrl } from '../types/api';
import {GetUserProfileResponse, GetUserRatingsResponse} from '../types/api.responses';


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

  // ===== PROFILE =====

  getUserProfile(): Observable<GetUserProfileResponse['profile']> {
    return this.http.get<GetUserProfileResponse>(`${apiUrl}/users/me/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.profile),
      catchError(this.handleError)
    );
  }

  // ===== RATINGS =====

  getUserRatings(page = 1, size = 20): Observable<GetUserRatingsResponse> {
    return this.http.get<GetUserRatingsResponse>(`${apiUrl}/users/me/ratings?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ===== VALIDATION & UTIL =====

  isAuthenticated(): boolean {
    return !!localStorage.getItem('imdb-token');
  }

  formatRating(rating: number): string {
    return `${rating}/10`;
  }

  calculateAverageRating(ratings: number[]): number {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, cur) => acc + cur, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  // ===== STATISTICS SUMMARY =====

  getUserStatisticsSummary(): Observable<{
    totalRatings: number;
    averageRating: number;
    watchlistCount: number;
    favoriteGenres: string[];
    ratingsThisMonth: number;
    recentActivity: any[];
  }> {
    return this.getUserProfile().pipe(
      map(profile => ({
        totalRatings: profile.statistics.total_ratings,
        averageRating: profile.statistics.average_rating,
        watchlistCount: profile.statistics.watchlist_count,
        favoriteGenres: profile.statistics.favorite_genres,
        ratingsThisMonth: 0, // would need endpoint to compute
        recentActivity: []   // would need endpoint to fill
      })),
      catchError(this.handleError)
    );
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
