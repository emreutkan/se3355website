import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-slider',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './movie-slider.component.html',
  styleUrls: ['./movie-slider.component.css']
})
export class MovieSliderComponent implements OnInit, OnDestroy {
  private languageService = inject(LanguageService);

  @Input() movies: Movie[] = [];
  @Input() autoSlide = true;
  @Input() slideInterval = 5000;
  @Input() title = '';
  @Input() showTrailer = false;

  currentIndex = 0;
  slideTimer: any;
  isPlaying = false;

  currentLang = 'en';
  private langSubscription!: Subscription;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    if (this.autoSlide && this.movies.length > 1) {
      this.startAutoSlide();
    }
    this.currentLang = this.languageService.getCurrentLanguage();
    this.langSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  startAutoSlide() {
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  stopAutoSlide() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  nextSlide() {
    if (this.movies.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.movies.length;
    }
  }

  prevSlide() {
    if (this.movies.length > 0) {
      this.currentIndex = this.currentIndex === 0 ? this.movies.length - 1 : this.currentIndex - 1;
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.stopAutoSlide();
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }

  get currentMovie(): Movie | null {
    return this.movies[this.currentIndex] || null;
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

  getVisibleMovies(): Movie[] {
    return this.movies.slice(this.currentIndex, this.currentIndex + 5);
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  getMovieYear(movie: Movie): string {
    return movie.year.toString();
  }

  getRuntime(movie: Movie): string {
    if (!movie.runtime_min) return 'Runtime unknown';
    const hours = Math.floor(movie.runtime_min / 60);
    const minutes = movie.runtime_min % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  getGenresText(movie: Movie): string {
    // Backend doesn't provide genres, so return language or default
    return movie.language || 'Drama';
  }

  getPosterUrl(movie: Movie): string {
    return movie.image_url || '';
  }

  getBackdropUrl(movie: Movie): string {
    return movie.image_url || '';
  }

  onImageError(event: any, movie: Movie): void {
    // Hide the image element if backend image fails to load
    event.target.style.display = 'none';
  }

  onWatchTrailer(movie: Movie) {
    // Trailer functionality to be implemented
    this.isPlaying = true;
    this.stopAutoSlide();
  }

  onAddToWatchlist(movie: Movie) {
    // Watchlist functionality to be implemented
  }

  onLearnMore(movie: Movie) {
    // Navigate to movie details page
  }

  getRatingStars(rating: number): number[] {
    const stars = Math.round(rating / 2); // Convert 10-point scale to 5-star scale
    return Array(5).fill(0).map((_, i) => i < stars ? 1 : 0);
  }
}
