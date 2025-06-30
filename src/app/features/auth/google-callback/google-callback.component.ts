import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="callback-container">
      <div *ngIf="!error; else showError">
        <p>Finalizing your sign-in...</p>
        <div class="spinner"></div>
      </div>
      <ng-template #showError>
        <div class="error-box">
          <h2>Authentication Failed</h2>
          <p>{{ error }}</p>
          <a routerLink="/auth/login" class="retry-button">Try Again</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Roboto', sans-serif;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #f5c518;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-box {
      text-align: center;
      padding: 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .retry-button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #f5c518;
      color: #000;
      text-decoration: none;
      border-radius: 4px;
    }
  `]
})
export class GoogleCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  error: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];

      if (accessToken) {
        this.authService.handleGoogleLoginCallback(accessToken, refreshToken);
        this.authService.getCurrentUserProfile().subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Failed to fetch user profile after Google login', err);
            this.error = 'Could not fetch your profile. Please try logging in again.';
            this.authService.logout();
          }
        });
      } else {
        this.error = 'Invalid authentication response from server. Missing tokens.';
      }
    });
  }
} 