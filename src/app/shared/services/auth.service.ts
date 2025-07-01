import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { apiUrl } from '../types/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('imdb-token');
    const userStr = localStorage.getItem('imdb-user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('imdb-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ===== MIRROR BACKEND AuthService.register() =====
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${apiUrl}/auth/register`, userData)
      .pipe(catchError(this.handleAuthError));
  }

  // ===== MIRROR BACKEND AuthService.login() =====
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleAuthError)
      );
  }

  // ===== MIRROR BACKEND AuthService.google_auth() =====
  googleAuth(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${apiUrl}/auth/google`, { token })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleAuthError)
      );
  }

  // ===== Google OAuth flow initiation =====
  initiateGoogleLogin(): void {
    const clientId = '554088359923-ivcsq00lju65qvg7op946eij0l88vl3r.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:5000/api/auth/google/callback';
    const scope = 'openid email profile';
    const responseType = 'code';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&response_type=${responseType}`;

    window.location.href = authUrl;
  }

  // ===== Handle Google OAuth callback =====
  handleGoogleCallback(code: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${apiUrl}/auth/google/callback?code=${code}`)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleAuthError)
      );
  }

  // ===== MIRROR BACKEND AuthService.logout() =====
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.post(`${apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        tap(() => this.clearLocalStorage()),
        catchError(error => {
          // Even if logout fails on server, clear local storage
          this.clearLocalStorage();
          return of(null);
        })
      );
  }

  // ===== MIRROR BACKEND AuthService.refresh_token() =====
  refreshToken(): Observable<{ access_token: string }> {
    const refreshToken = localStorage.getItem('imdb-refresh-token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });

    return this.http.post<{ access_token: string }>(`${apiUrl}/auth/refresh`, {}, { headers })
      .pipe(
        tap(response => {
          localStorage.setItem('imdb-token', response.access_token);
        }),
        catchError(error => {
          this.logout();
          return throwError(error);
        })
      );
  }

  // ===== MIRROR BACKEND AuthService.get_current_user() =====
  getCurrentUserProfile(): Observable<User> {
    const headers = this.getAuthHeaders();

    return this.http.get<{ user: User }>(`${apiUrl}/auth/me`, { headers })
      .pipe(
        map(response => response.user),
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('imdb-user', JSON.stringify(user));
        }),
        catchError(this.handleAuthError)
      );
  }

  // ===== AUTHENTICATION STATE =====
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && localStorage.getItem('imdb-token') !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ===== HELPER METHODS (UI state management) =====
  private clearLocalStorage(): void {
    localStorage.removeItem('imdb-token');
    localStorage.removeItem('imdb-user');
    localStorage.removeItem('imdb-refresh-token');
    this.currentUserSubject.next(null);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('imdb-token', response.access_token);
    localStorage.setItem('imdb-refresh-token', response.refresh_token);
    this.getCurrentUserProfile().subscribe({
      error: (err) => console.error('Failed to fetch full user profile after login', err)
    });
  }

  handleGoogleLoginCallback(accessToken: string, refreshToken: string | null): void {
    localStorage.setItem('imdb-token', accessToken);
    if (refreshToken) {
      localStorage.setItem('imdb-refresh-token', refreshToken);
    }
  }

  // ===== ERROR HANDLING =====
  private handleAuthError = (error: any): Observable<never> => {
    console.error('AuthService error:', error);

    let errorMessage = 'An error occurred';
    if (error.error?.msg) {
      errorMessage = error.error.msg;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({ message: errorMessage, status: error.status }));
  };
}
