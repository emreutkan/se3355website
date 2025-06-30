import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { apiUrl } from '../types/api';
import { Movie } from '../models/movie.model';
import { AuthService } from './auth.service';

export interface WatchlistItem {
  added_at: string;
  movie: Movie;
  movie_id: string;
  user_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private watchlistSubject = new BehaviorSubject<WatchlistItem[]>([]);
  watchlist$ = this.watchlistSubject.asObservable();

  private watchlistCountSubject = new BehaviorSubject<number>(0);
  watchlistCount$ = this.watchlistCountSubject.asObservable();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.authService.isLoggedIn$.pipe(
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          return this.fetchWatchlist();
        } else {
          this.clearWatchlist();
          return of(null);
        }
      })
    ).subscribe();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('imdb-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  fetchWatchlist(): Observable<WatchlistItem[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ watchlist: WatchlistItem[] }>(`${apiUrl}/users/me/watchlist`, { headers }).pipe(
      map(response => response.watchlist),
      tap(watchlist => {
        this.watchlistSubject.next(watchlist);
        this.watchlistCountSubject.next(watchlist.length);
      }),
      catchError(err => {
        console.error('Failed to fetch watchlist', err);
        return of([]);
      })
    );
  }

  toggleWatchlist(movieId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ action: 'added' | 'removed' }>(`${apiUrl}/users/me/watchlist/${movieId}`, {}, { headers }).pipe(
      tap(() => {
        this.fetchWatchlist().subscribe();
      })
    );
  }

  isMovieInWatchlist(movieId: string): Observable<boolean> {
    return this.watchlist$.pipe(
      map(watchlist => watchlist.some(item => item.movie.id === movieId))
    );
  }

  private clearWatchlist(): void {
    this.watchlistSubject.next([]);
    this.watchlistCountSubject.next(0);
  }
} 