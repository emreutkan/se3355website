import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../../shared/services/movie.service';
import { Movie } from '../../../shared/models/movie.model';
import { CommonModule, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { WatchlistService } from '../../../shared/services/watchlist.service';
import { Observable, of, Subscription } from 'rxjs';
import { AuthService } from "../../../shared/services/auth.service";
import { LanguageService } from '../../../shared/services/language.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);

  movie: Movie | null = null;
  isInWatchlist$: Observable<boolean> = of(false);
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;

  currentLang = 'en';
  private langSubscription!: Subscription;

  showTrailer = false;
  trailerUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getMovieDetails(movieId).subscribe((movie: Movie) => {
        this.movie = movie;
        if (this.movie?.trailer_url) {
          this.trailerUrl = this.getSafeTrailerUrl(this.movie.trailer_url);
        }
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

  playTrailer(): void {
    this.showTrailer = true;
  }

  private getSafeTrailerUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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