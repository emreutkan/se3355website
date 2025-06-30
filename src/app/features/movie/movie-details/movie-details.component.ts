import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../../shared/services/movie.service';
import { Movie } from '../../../shared/models/movie.model';
import { CommonModule, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { WatchlistService } from '../../../shared/services/watchlist.service';
import { Observable, of, Subscription } from 'rxjs';
import { AuthService } from "../../../shared/services/auth.service";
import { LanguageService } from '../../../shared/services/language.service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgForOf, DecimalPipe],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private watchlistService = inject(WatchlistService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);

  movie: Movie | null = null;
  isInWatchlist$: Observable<boolean> = of(false);
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;

  currentLang = 'en';
  private langSubscription!: Subscription;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getMovieDetails(movieId).subscribe(movie => {
        this.movie = movie;
        this.isInWatchlist$ = this.watchlistService.isMovieInWatchlist(movie.id);
      });
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

  getMovieTitle(movie: Movie | null): string {
    if (!movie) return '';
    if (this.currentLang === 'tr' && movie.title_tr) {
      return movie.title_tr;
    }
    return movie.title;
  }

  getMovieSummary(movie: Movie | null): string {
    if (!movie) return '';
    if (this.currentLang === 'tr' && movie.summary_tr) {
      return movie.summary_tr;
    }
    return movie.summary;
  }

  toggleWatchlist(): void {
    if (this.movie) {
      this.watchlistService.toggleWatchlist(this.movie.id).subscribe();
    }
  }

  getDirector(): string {
    return 'N/A';
  }

  getWriters(): string {
    return 'N/A';
  }
} 