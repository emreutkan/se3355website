import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MovieService } from '../../../shared/services/movie.service';

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
  private destroy$ = new Subject<void>();

  searchQuery = '';
  searchType: 'all' | 'title' | 'people' = 'all';
  loading = false;
  error: string | null = null;

  movieResults: SearchResult[] = [];
  personResults: PersonResult[] = [];
  hasResults = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['q'] || '';
        this.searchType = params['type'] || 'all';
        
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

    this.movieService.search(this.searchQuery, this.searchType).subscribe({
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

  onExactMatches(type: 'titles' | 'people') {
    this.router.navigate(['/search'], {
      queryParams: { 
        q: this.searchQuery,
        type: type === 'titles' ? 'title' : 'people'
      }
    });
  }

  getSearchTypeDisplay(): string {
    switch (this.searchType) {
      case 'all': return 'All';
      case 'title': return 'Titles';
      case 'people': return 'People';
      default: return 'All';
    }
  }
} 