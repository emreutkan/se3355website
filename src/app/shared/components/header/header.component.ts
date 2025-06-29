import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { MovieService } from '../../services/movie.service';
import { UserService } from '../../services/user.service';
import {User} from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoggedIn = false;
  userProfile: User | null = null;
  currentLanguage = 'en';
  showLanguageDropdown = false;
  showUserDropdown = false;
  watchlistCount = 0;

  // System health monitoring
  systemHealth: 'healthy' | 'degraded' | 'down' | 'unknown' = 'unknown';
  apiInfo: any = null;
  showSystemStatus = false;

  supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to current user and authentication state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.userProfile = user;

      });

    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(language => {
        this.currentLanguage = language;
      });


  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserDisplayName(): string {
    if (!this.userProfile) return 'User';

    if (this.userProfile.full_name) {
      return this.userProfile.full_name;
    }

    if (this.userProfile.email) {
      return this.userProfile.email.split('@')[0];
    }

    return 'User';
  }



  onSearch(query: string) {
    if (query.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: query.trim(), type: 'all' }
      });
    }
  }

  onSignIn() {
    this.router.navigate(['/auth/login']);
  }

  onProfile() {
    this.router.navigate(['/profile']);
  }

  onWatchlist() {
    this.router.navigate(['/watchlist']);
  }

  onRatings() {
    this.router.navigate(['/my-ratings']);
  }

  onSettings() {
    this.router.navigate(['/settings']);
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if logout fails on server, we still navigate to home
        this.router.navigate(['/']);
      }
    });
  }

  toggleLanguageDropdown() {
    this.showLanguageDropdown = !this.showLanguageDropdown;
    // Close user dropdown when opening language dropdown
    if (this.showLanguageDropdown) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
    // Close language dropdown when opening user dropdown
    if (this.showUserDropdown) {
      this.showLanguageDropdown = false;
    }
  }

  switchLanguage(languageCode: string) {
    this.languageService.setLanguage(languageCode);
    this.showLanguageDropdown = false;
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  getCurrentLanguageFlag(): string {
    const lang = this.supportedLanguages.find(l => l.code === this.currentLanguage);
    return lang?.flag || '🇺🇸';
  }

  getCurrentLanguageName(): string {
    const lang = this.supportedLanguages.find(l => l.code === this.currentLanguage);
    return lang?.name || 'English';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Don't close dropdowns if clicking inside them
    if (target.closest('.user-profile') || target.closest('.user-dropdown')) {
      return;
    }

    if (target.closest('.language-switcher') || target.closest('.language-dropdown')) {
      return;
    }

    // Close all dropdowns when clicking outside
    this.showLanguageDropdown = false;
    this.showUserDropdown = false;
    this.showSystemStatus = false;
  }


  toggleSystemStatus() {
    this.showSystemStatus = !this.showSystemStatus;
    // Close other dropdowns
    if (this.showSystemStatus) {
      this.showLanguageDropdown = false;
      this.showUserDropdown = false;
    }
  }

  getHealthStatusColor(): string {
    switch (this.systemHealth) {
      case 'healthy': return '#4ade80';
      case 'degraded': return '#fbbf24';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getHealthStatusText(): string {
    switch (this.systemHealth) {
      case 'healthy': return 'All systems operational';
      case 'degraded': return 'Some services degraded';
      case 'down': return 'System unavailable';
      default: return 'Status unknown';
    }
  }

  getHealthStatusIcon(): string {
    switch (this.systemHealth) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '❓';
    }
  }
}
