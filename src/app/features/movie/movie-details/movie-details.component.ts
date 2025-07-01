import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MovieService } from '../../../shared/services/movie.service';
import { UserService } from '../../../shared/services/user.service';
import { FormatUtilsService } from '../../../shared/services/format-utils.service';
import { WatchlistService } from '../../../shared/services/watchlist.service';
import { Movie, Rating } from '../../../shared/models/movie.model';
import { CommonModule } from '@angular/common';
import { Observable, of, Subscription, BehaviorSubject } from 'rxjs';
import { AuthService } from "../../../shared/services/auth.service";
import { LanguageService } from '../../../shared/services/language.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private movieService: MovieService = inject(MovieService);
  private userService: UserService = inject(UserService);
  private watchlistService: WatchlistService = inject(WatchlistService);
  private authService: AuthService = inject(AuthService);
  private languageService: LanguageService = inject(LanguageService);
  private formatUtils: FormatUtilsService = inject(FormatUtilsService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  // ONLY UI state and presentation logic
  movie$ = new BehaviorSubject<Movie | null>(null);
  currentUser$ = this.authService.currentUser$;
  isInWatchlist$: Observable<boolean> = of(false);
  trailerUrl: SafeResourceUrl | null = null;
  currentLang = 'en';
  private langSubscription!: Subscription;

  ngOnInit(): void {
    // NO business logic - just coordinate service calls
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieData(movieId);
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



  // NO business logic - delegate to service
  toggleWatchlist(): void {
    const movie = this.movie$.value;
    if (movie) {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/auth/login']);
        return;
      }
      
      this.userService.toggleWatchlist(movie.id).subscribe({
        next: () => {
          this.isInWatchlist$ = this.watchlistService.isMovieInWatchlist(movie.id);
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  onRateClick(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    const movie = this.movie$.value;
    if (movie) {
      this.router.navigate(['/ratings', movie.id]);
    }
  }

  // DELEGATE business logic to FormatUtilsService
  formatRuntime(minutes: number): string {
    return this.formatUtils.formatRuntime(minutes);
  }

  getPosterUrl(imageUrl: string): string {
    return this.formatUtils.getPosterUrl(imageUrl);
  }

  formatRating(rating: number): string {
    return this.formatUtils.formatRating(rating);
  }

  formatReleaseDate(dateStr: string): string {
    return this.formatUtils.formatReleaseDate(dateStr);
  }

  // NO business logic - just UI coordination
  private loadMovieData(movieId: string): void {
    this.movieService.getMovieDetail(movieId).subscribe({
      next: (movie: Movie) => {
        this.movie$.next(movie);
        if (movie.trailer_url) {
          this.trailerUrl = this.getSafeTrailerUrl(movie.trailer_url);
        }
        this.isInWatchlist$ = this.watchlistService.isMovieInWatchlist(movie.id);
      },
      error: (error) => this.handleError(error)
    });
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

  private handleError(error: any): void {
    console.error('MovieDetailsComponent error:', error);
    // Handle error display in UI
  }
} 