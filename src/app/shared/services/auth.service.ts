import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {AuthResponse, LoginCredentials, RegisterData, RegisterResponse, User} from '../models/user.model';
import {apiUrl} from '../types/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient) {
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

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

  register(userData: RegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${apiUrl}/auth/register`, userData)
      .pipe(
        catchError(error => this.handleAuthError(error))
      );
  }

  // Google OAuth login initiation
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

  // Handle Google OAuth callback (if needed for client-side handling)
  handleGoogleCallback(code: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${apiUrl}/auth/google/callback?code=${code}`)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

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

  getCurrentUserProfile(): Observable<User> {
    const headers = this.getAuthHeaders();

    return this.http.get<{ user: User }>(`${apiUrl}/auth/me`, { headers })
      .pipe(
        map(response => response.user),
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('imdb-user', JSON.stringify(user));
        }),
        catchError(error => this.handleAuthError(error))
      );
  }


  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && localStorage.getItem('imdb-token') !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('imdb-token');
    localStorage.removeItem('imdb-user');
    localStorage.removeItem('imdb-refresh-token');
    this.currentUserSubject.next(null);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('imdb-token', response.access_token);
    localStorage.setItem('imdb-refresh-token', response.refresh_token);
    localStorage.setItem('imdb-user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private handleAuthError(error: any): Observable<never> {
    console.error('Auth error:', error);

    let errorMessage = 'An error occurred';
    if (error.error?.msg) {
      errorMessage = error.error.msg;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError({ message: errorMessage, status: error.status });
  }

  handleGoogleLoginCallback(accessToken: string, refreshToken: string | null, user: User): void {
    localStorage.setItem('imdb-token', accessToken);
    if (refreshToken) {
      localStorage.setItem('imdb-refresh-token', refreshToken);
    }
    localStorage.setItem('imdb-user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Password validation
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // File upload validation for profile photos
  validatePhoto(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { valid: true };
  }

  // Check if email is valid
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if country code is valid (2-letter ISO code)
  validateCountryCode(country: string): boolean {
    return /^[A-Z]{2}$/.test(country);
  }
}
