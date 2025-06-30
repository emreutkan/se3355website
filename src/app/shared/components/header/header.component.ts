import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MovieService } from '../../services/movie.service';
import { User } from '../../models/user.model';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private movieService = inject(MovieService);
  private router = inject(Router);
  private watchlistService = inject(WatchlistService);

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
  showSearchCategoryDropdown = false;
  searchCategories = [
    { key: 'all', name: 'All', icon: 'fas fa-search' },
    { key: 'titles', name: 'Titles', icon: 'fas fa-film' },
    { key: 'celebs', name: 'Celebs', icon: 'fas fa-user-friends' }
  ];
  selectedSearchCategory = this.searchCategories[0];
  showTypeahead = false;
  typeaheadResults: {
    titles: any[],
    celebs: any[]
  } = { titles: [], celebs: [] };

  // System health monitoring
  systemHealth: 'healthy' | 'degraded' | 'down' | 'unknown' = 'unknown';
  apiInfo: any = null;
  showSystemStatus = false;

  supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  isLoggedIn$: Observable<boolean>;
  user$: Observable<User | null>;
  watchlistCount$: Observable<number>;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.user$ = this.authService.currentUser$;
    this.watchlistCount$ = this.watchlistService.watchlistCount$;
  }

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

    if (query.length > 1) {
      this.searchInputSubject.next(query);
    } else {
      this.typeaheadResults = { titles: [], celebs: [] };
      this.showTypeahead = false;
    }
  }

  performTypeaheadSearch(query: string) {
    if (query.length < 2) {
      this.typeaheadResults = { titles: [], celebs: [] };
      this.showTypeahead = false;
      return;
    }

    let searchType = this.selectedSearchCategory.key;
    if (searchType === 'titles') searchType = 'title';
    if (searchType === 'celebs') searchType = 'people';

    this.movieService.search(query, searchType as any).subscribe({
      next: (response) => {
        this.typeaheadResults = {
          titles: response.results.titles || [],
          celebs: response.results.people || []
        };
        this.showTypeahead = this.typeaheadResults.titles.length > 0 || this.typeaheadResults.celebs.length > 0;
      },
      error: (error) => {
        console.error('Typeahead search error:', error);
        this.typeaheadResults = { titles: [], celebs: [] };
        this.showTypeahead = false;
      }
    });
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = '';
    this.showTypeahead = false;
    this.typeaheadResults = { titles: [], celebs: [] };

    // Navigate based on suggestion type
    if (suggestion.media_type === 'movie' || suggestion.media_type === 'tv' || suggestion.title) {
      this.router.navigate(['/movie', suggestion.id]);
    } else if (suggestion.media_type === 'person' || suggestion.full_name) {
      this.router.navigate(['/person', suggestion.id]);
    }
  }

  onSearchBlur() {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      this.showTypeahead = false;
    }, 200);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: {
          q: this.searchQuery.trim(),
          category: this.selectedSearchCategory.key
        }
      });
      this.searchQuery = '';
    }
    this.showTypeahead = false;
  }

  // ================== SEARCH CATEGORY DROPDOWN ==================

  toggleSearchCategoryDropdown() {
    this.showSearchCategoryDropdown = !this.showSearchCategoryDropdown;
  }

  selectSearchCategory(category: any) {
    this.selectedSearchCategory = category;
    this.showSearchCategoryDropdown = false;
    // Trigger a new search if there's already a query
    if (this.searchQuery.length > 0) {
      this.performTypeaheadSearch(this.searchQuery);
    }
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

    if (target.closest('.search-category-dropdown-trigger') || target.closest('.search-category-dropdown')) {
      return;
    }

    // Close all dropdowns when clicking outside
    this.showLanguageDropdown = false;
    this.showUserDropdown = false;
    this.showSystemStatus = false;
    this.showSearchCategoryDropdown = false;
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
