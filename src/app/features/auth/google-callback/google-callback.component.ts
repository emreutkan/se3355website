import { Component, OnInit } from '@angular/core';
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
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        this.error = 'Authentication was cancelled or failed. Please try again.';
        console.error('Google OAuth Error:', error);
        return;
      }

      if (!code) {
        this.error = 'No authentication code found. Please try logging in again.';
        return;
      }

      this.authService.handleGoogleCallback(code).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err.message || 'An unknown error occurred during Google sign-in.';
        }
      });
    });
  }
} 