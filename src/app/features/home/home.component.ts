import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {MovieCardComponent} from '../../shared/components/movie-card/movie-card.component';
import {MovieSliderComponent} from '../../shared/components/movie-slider/movie-slider.component';
import {Movie} from '../../shared/models/movie.model';
import {MovieService} from '../../shared/services/movie.service';
import {LanguageService} from '../../shared/services/language.service';
import { PopularMoviesComponent } from './components/popular-movies/popular-movies.component';
import { AuthService } from '../../shared/services/auth.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent, MovieSliderComponent, PopularMoviesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private authService = inject(AuthService);

  @ViewChild('sliderTrack', { static: false }) sliderTrack!: ElementRef;

  allMovies: Movie[] = [];
  featuredMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];

  isLoading = true;
  error: string | null = null;

  // Slider properties
  canScrollLeft = false;
  canScrollRight = true;
  private currentScrollPosition = 0;

  isLoggedIn$ = this.authService.isLoggedIn$;
  user$ = this.authService.currentUser$;

  currentPage = 1;

  constructor() {}

  ngOnInit(): void {
    this.loadAllMovies();
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.user$ = this.authService.currentUser$;
  }

  loadAllMovies() {
    this.isLoading = true;
    this.error = null;

    // Load popular movies first (these will be featured)
    this.movieService.getMovies(1).subscribe({
      next: (popularResponse) => {
        this.allMovies = popularResponse.movies || [];
        this.featuredMovies = this.allMovies.slice(0, 10); // Fix: use allMovies instead of popularMovies
        this.popularMovies = this.allMovies; // Set popularMovies as well
        this.isLoading = false; // Fix: Turn off loading on success

        // Load other categories
        // this.loadOtherCategories();
      },
      error: (error) => {
        console.error('Error loading popular movies:', error);
        this.error = 'Failed to load movies. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // private loadOtherCategories() {
  //   // Load top rated movies
  //   this.movieService.getTopRatedMovies(1).subscribe({
  //     next: (response) => {
  //       this.topRatedMovies = response.movies || [];
  //     },
  //     error: (error) => {
  //       console.error('Error loading top rated movies:', error);
  //     }
  //   });
  //
  //   // Load recent movies
  //   this.movieService.getNowPlayingMovies(1).subscribe({
  //     next: (response) => {
  //       this.recentMovies = response.movies || [];
  //     },
  //     error: (error) => {
  //       console.error('Error loading recent movies:', error);
  //     }
  //   });
  //
  //   // Load all movies
  //   this.movieService.getMovies(1, 'popularity').subscribe({
  //     next: (response) => {
  //       this.allMovies = response.movies || [];
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading all movies:', error);
  //       this.isLoading = false;
  //     }
  //   });
  // }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  onRetry() {
    this.loadAllMovies();
  }

  getSlicedMovies(movies: Movie[], count = 12): Movie[] {
    return movies.slice(0, count);
  }

  // Slider methods
  scrollSlider(direction: 'left' | 'right') {
    if (!this.sliderTrack) return;

    const trackElement = this.sliderTrack.nativeElement;
    const cardWidth = 220; // width of each card including margin
    const scrollAmount = cardWidth * 3; // scroll 3 cards at a time

    if (direction === 'left') {
      this.currentScrollPosition = Math.max(0, this.currentScrollPosition - scrollAmount);
    } else {
      const maxScroll = trackElement.scrollWidth - trackElement.clientWidth;
      this.currentScrollPosition = Math.min(maxScroll, this.currentScrollPosition + scrollAmount);
    }

    trackElement.scrollTo({
      left: this.currentScrollPosition,
      behavior: 'smooth'
    });

    this.updateScrollButtons();
  }

  private updateScrollButtons() {
    if (!this.sliderTrack) return;

    const trackElement = this.sliderTrack.nativeElement;
    this.canScrollLeft = this.currentScrollPosition > 0;
    this.canScrollRight = this.currentScrollPosition < (trackElement.scrollWidth - trackElement.clientWidth);
  }

  navigateToMovie(movieId: string) {
    this.router.navigate(['/movie', movieId]);
  }

  openTrailer(trailerUrl: string) {
    if (trailerUrl) {
      window.open(trailerUrl, '_blank', 'noopener,noreferrer');
    }
  }

  onSearch(query: string): void {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // Here you can add logic to fetch movies for the new page
  }
}
