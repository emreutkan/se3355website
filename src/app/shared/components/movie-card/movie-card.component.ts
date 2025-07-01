import { Component, Input, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { Observable, of, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { FormatUtilsService } from '../../services/format-utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css']
})
export class MovieCardComponent implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private watchlistService = inject(WatchlistService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  private formatUtils = inject(FormatUtilsService);
  private router = inject(Router);

  @Input() movie!: Movie;
  @Input() showRating = true;
  @Input() showYear = true;
  @Input() showStatus = false;
  isInWatchlist$: Observable<boolean> = of(false);
  isLoggedIn$: Observable<boolean>;

  currentLang = 'en';
  private langSubscription!: Subscription;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    if (this.movie) {
      this.isInWatchlist$ = this.watchlistService.isMovieInWatchlist(this.movie.id);
    }
    this.currentLang = this.languageService.getCurrentLanguage();
    this.langSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  getMovieTitle(): string {
    if (!this.movie) return '';
    if (this.currentLang === 'tr' && this.movie.title_tr) {
      return this.movie.title_tr;
    }
    return this.movie.title;
  }

  getPosterUrl(): string {
    return this.formatUtils.getPosterUrl(this.movie.image_url || '');
  }

  getRating(): number {
    return Math.round(this.movie.imdb_score * 10) / 10;
  }

  getFormattedRating(): string {
    return this.formatUtils.formatRating(this.getRating());
  }

  getYear(): string {
    return this.movie.year.toString();
  }

  getVoteCount(): number {
    return this.movie.rating_count || 0;
  }

  getFormattedVoteCount(): string {
    const count = this.getVoteCount();
    if (count === 0) return '(0 votes)';

    if (count >= 1000000) {
      return `(${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M votes)`;
    } else if (count >= 1000) {
      return `(${(count / 1000).toFixed(1).replace(/\.0$/, '')}K votes)`;
    } else {
      return `(${count.toLocaleString()} votes)`;
    }
  }

  formatRuntime(minutes: number): string {
    return this.formatUtils.formatRuntime(minutes);
  }

  formatVotes(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    } else {
      return count.toLocaleString();
    }
  }

  toggleWatchlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if user is authenticated before allowing watchlist action
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.watchlistService.toggleWatchlist(this.movie.id).subscribe();
  }

  onTrailerClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.movie.trailer_url) {
      window.open(this.movie.trailer_url, '_blank');
    } else {
      console.log('No trailer available for this movie');
    }
  }

  onImageError(event: any): void {
    // Hide the image element if backend image fails to load
    event.target.style.display = 'none';
  }
}
