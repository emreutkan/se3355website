import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  private getSafeTrailerUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractVideoId(url: string): string {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  formatRuntime(runtimeMin: number | undefined): string {
    if (!runtimeMin || runtimeMin <= 0) return '';
    const hours = Math.floor(runtimeMin / 60);
    const minutes = runtimeMin % 60;
    return `${hours}h ${minutes}m`;
  }

  toggleWatchlist(): void {
    if (this.movie) {
      this.watchlistService.toggleWatchlist(this.movie.id).subscribe();
    }
  }

  private addDummyDataForUi(movie: Movie): Movie {
    // API data doesn't contain director/writers, so adding dummy data to match UI
    const movieWithDummies = { ...movie };
    if (!movieWithDummies.director) {
      movieWithDummies.director = ['Joseph Kosinski'];
    }
    if (!movieWithDummies.writers) {
      movieWithDummies.writers = ['Ehren Kruger', 'Joseph Kosinski'];
    }
    return movieWithDummies;
  }
} 