import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MovieService } from '../../../shared/services/movie.service';
import { LanguageService } from '../../../shared/services/language.service';
import { Movie } from '../../../shared/models/movie.model';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

interface SearchResult extends Pick<Movie, 'id' | 'title' | 'year' | 'imdb_score' | 'title_tr' | 'image_url'> {
}

interface PersonResult {
  id: string;
  full_name: string;
  photo_url?: string;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private languageService = inject(LanguageService);

  private destroy$ = new Subject<void>();
  currentLang = 'en';
  private langSubscription!: Subscription;

  searchQuery = '';
  searchCategory: 'all' | 'titles' | 'celebs' = 'all';
  loading = false;
  error: string | null = null;

  movieResults: SearchResult[] = [];
  personResults: PersonResult[] = [];
  hasResults = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['q'] || '';
        this.searchCategory = params['category'] || 'all';
        
        if (this.searchQuery.trim()) {
          this.performSearch();
        }
      });
    
    this.currentLang = this.languageService.getCurrentLanguage();
    this.langSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  getMovieTitle(movie: SearchResult): string {
    if (this.currentLang === 'tr' && movie.title_tr) {
      return movie.title_tr;
    }
    return movie.title;
  }

  performSearch() {
    if (!this.searchQuery.trim()) return;

    this.loading = true;
    this.error = null;
    
    let searchType: string = this.searchCategory;
    if (searchType === 'titles') searchType = 'title';
    if (searchType === 'celebs') searchType = 'people';

    this.movieService.searchMovies(this.searchQuery, searchType as any).subscribe({
      next: (response: any) => {
        this.movieResults = response.results.titles || [];
        this.personResults = response.results.people || [];
        this.hasResults = this.movieResults.length > 0 || this.personResults.length > 0;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to perform search';
        this.loading = false;
        console.error('Search error:', error);
      }
    });
  }

  onMovieClick(movie: SearchResult) {
    this.router.navigate(['/movie', movie.id]);
  }

  getSearchCategoryDisplay(): string {
    switch (this.searchCategory) {
      case 'all': return 'All';
      case 'titles': return 'Titles';
      case 'celebs': return 'People';
      default: return 'All';
    }
  }
} 