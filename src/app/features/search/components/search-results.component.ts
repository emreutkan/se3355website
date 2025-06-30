import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MovieService } from '../../../shared/services/movie.service';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

interface SearchResult {
  id: string;
  title: string;
  year?: number;
  imdb_score?: number;
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

  private destroy$ = new Subject<void>();

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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch() {
    if (!this.searchQuery.trim()) return;

    this.loading = true;
    this.error = null;
    
    let searchType: string = this.searchCategory;
    if (searchType === 'titles') searchType = 'title';
    if (searchType === 'celebs') searchType = 'people';

    this.movieService.search(this.searchQuery, searchType as any).subscribe({
      next: (response) => {
        this.movieResults = response.results.titles || [];
        this.personResults = response.results.people || [];
        this.hasResults = this.movieResults.length > 0 || this.personResults.length > 0;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to perform search';
        this.loading = false;
        console.error('Search error:', error);
      }
    });
  }

  onMovieClick(movie: SearchResult) {
    this.router.navigate(['/movie', movie.id]);
  }

  onPersonClick(person: PersonResult) {
    this.router.navigate(['/actor', person.id]);
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