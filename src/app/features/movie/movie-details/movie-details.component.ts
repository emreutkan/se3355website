import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MovieService } from '../../../shared/services/movie.service';
import { Actor, Movie } from '../../../shared/models/movie.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WatchlistService } from '../../../shared/services/watchlist.service';
import { Observable, of, Subscription } from 'rxjs';
import { AuthService } from "../../../shared/services/auth.service";
import { LanguageService } from '../../../shared/services/language.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private movieService: MovieService = inject(MovieService);
  private watchlistService: WatchlistService = inject(WatchlistService);
  private authService: AuthService = inject(AuthService);
  private languageService: LanguageService = inject(LanguageService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  movie: Movie | null = null;
  isInWatchlist$: Observable<boolean> = of(false);
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  trailerUrl: SafeResourceUrl | null = null;

  private langSubscription!: Subscription;
  currentLang = 'en';

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getMovieDetails(movieId).subscribe((movieData: Movie) => {
        this.movie = this.addDummyDataForUi(movieData);
        if (this.movie?.trailer_url) {
          this.trailerUrl = this.getSafeTrailerUrl(this.movie.trailer_url);
        }
        this.isInWatchlist$ = this.watchlistService.isMovieInWatchlist(this.movie.id);
      });
    }

    this.currentLang = this.languageService.getCurrentLanguage();
    this.langSubscription = this.languageService.currentLanguage$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  toggleWatchlist(): void {
    if (this.movie) {
      // Check if user is authenticated before allowing watchlist action
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/auth/login']);
        return;
      }
      
      this.watchlistService.toggleWatchlist(this.movie.id).subscribe();
    }
  }

  onRateClick(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    if (this.movie) {
      this.router.navigate(['/ratings', this.movie.id]);
    }
  }

  private getSafeTrailerUrl(url: string): SafeResourceUrl {
    let embedUrl = url;

    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private addDummyDataForUi(movie: Movie): Movie {
    return {
      ...movie,
      popularity: movie.popularity || {
        movie_id: movie.id,
        rank: Math.floor(Math.random() * 1000) + 1, // Random rank for demo
        score: Math.random() * 100,
        snapshot_date: new Date().toISOString()
      }
    };
  }

  getPopularityRanking(): string {
    if (this.movie?.popularity?.rank) {
      return `#${this.movie.popularity.rank}`;
    }
    return '';
  }

  getPopularityTrend(): string {
    // This would normally come from comparing current vs previous rankings
    const trends = ['↗️ Up', '↘️ Down', '→ Same'];
    return trends[Math.floor(Math.random() * trends.length)];
  }
} 