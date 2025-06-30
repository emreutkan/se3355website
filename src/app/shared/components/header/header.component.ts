import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MovieService } from '../../services/movie.service';
import {User} from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchInputSubject = new Subject<string>();

  isLoggedIn = false;
  userProfile: User | null = null;
  currentLanguage = 'en';
  showLanguageDropdown = false;
  showUserDropdown = false;
  watchlistCount = 0;

  // Search functionality
  searchQuery = '';
  selectedSearchType: 'all' | 'title' | 'people' = 'all';
  showTypeahead = false;
  typeaheadSuggestions: Array<{
    id: string;
    type: 'movie' | 'actor';
    title: string;
    year?: number;
    image_url?: string;
  }> = [];

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
    private movieService: MovieService,
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

    // Setup typeahead search with debouncing
    this.searchInputSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performTypeaheadSearch(query);
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

  // ================== SEARCH FUNCTIONALITY ==================

  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    
    if (query.length >= 3) {
      this.searchInputSubject.next(query);
    } else {
      this.typeaheadSuggestions = [];
      this.showTypeahead = false;
    }
  }

  performTypeaheadSearch(query: string) {
    if (query.length < 3) {
      this.typeaheadSuggestions = [];
      return;
    }

    this.movieService.searchTypeahead(query).subscribe({
      next: (response) => {
        this.typeaheadSuggestions = response.suggestions;
        this.showTypeahead = this.typeaheadSuggestions.length > 0;
      },
      error: (error) => {
        console.error('Typeahead search error:', error);
        this.typeaheadSuggestions = [];
        this.showTypeahead = false;
      }
    });
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.title;
    this.showTypeahead = false;
    this.typeaheadSuggestions = [];
    
    // Navigate based on suggestion type
    if (suggestion.type === 'movie') {
      this.router.navigate(['/movie', suggestion.id]);
    } else if (suggestion.type === 'actor') {
      this.router.navigate(['/actor', suggestion.id]);
    }
  }

  onSearchBlur() {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      this.showTypeahead = false;
    }, 200);
  }

  onSearch(query: string) {
    if (query.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { 
          q: query.trim(), 
          type: this.selectedSearchType 
        }
      });
    }
    this.showTypeahead = false;
  }

  // ================== EXISTING FUNCTIONALITY ==================

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

    if (target.closest('.search-container') || target.closest('.typeahead-dropdown')) {
      return;
    }

    // Close all dropdowns when clicking outside
    this.showLanguageDropdown = false;
    this.showUserDropdown = false;
    this.showSystemStatus = false;
    this.showTypeahead = false;
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
      case 'down': return 'Service unavailable';
      default: return 'Checking status...';
    }
  }

  getHealthStatusIcon(): string {
    switch (this.systemHealth) {
      case 'healthy': return '✓';
      case 'degraded': return '⚠';
      case 'down': return '✗';
      default: return '?';
    }
  }
}
