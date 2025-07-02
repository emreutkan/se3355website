import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../shared/services/movie.service';
import { Movie } from '../../../../shared/models/movie.model';
import { MovieCardComponent } from '../../../../shared/components/movie-card/movie-card.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-popular-movies',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, TranslatePipe],
  templateUrl: './popular-movies.component.html',
  styleUrl: './popular-movies.component.css'
})
export class PopularMoviesComponent implements OnInit, AfterViewInit, OnDestroy {
  private movieService = inject(MovieService);

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  popularMovies: Movie[] = [];
  loading = true;
  error: string | null = null;
  canScrollLeft = false;
  canScrollRight = true;
  
  private scrollTimeout: any;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  ngAfterViewInit(): void {
    if (this.carousel) {
      // Initial update
      setTimeout(() => {
        this.updateScrollButtons();
      }, 100);
      
      // Add scroll event listener with debouncing
      this.carousel.nativeElement.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.carousel?.nativeElement) {
      this.carousel.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  private onScroll(): void {
    // Debounce scroll events to improve performance
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    this.scrollTimeout = setTimeout(() => {
      this.updateScrollButtons();
    }, 50);
  }

  loadPopularMovies(): void {
    this.loading = true;
    this.error = null;
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.popularMovies = movies.movies || [];
        this.loading = false;
        // Wait for DOM update before checking scroll buttons
        setTimeout(() => {
          this.updateScrollButtons();
        }, 200);
      },
      error: (error) => {
        this.error = 'Failed to load popular movies';
        this.loading = false;
        console.error('Error loading popular movies:', error);
      }
    });
  }

  scrollLeft(): void {
    if (!this.carousel) return;
    
    const element = this.carousel.nativeElement;
    const scrollAmount = 204 * 3; // 3 cards (180px + 24px gap)
    
    // If we're at the beginning, wrap to the end
    if (element.scrollLeft <= 10) {
      element.scrollTo({
        left: element.scrollWidth - element.clientWidth,
        behavior: 'smooth'
      });
    } else {
      element.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  scrollRight(): void {
    if (!this.carousel) return;
    
    const element = this.carousel.nativeElement;
    const scrollAmount = 204 * 3; // 3 cards (180px + 24px gap)
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    // If we're at the end, wrap to the beginning
    if (element.scrollLeft >= maxScroll - 10) {
      element.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    } else {
      element.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  private updateScrollButtons(): void {
    if (!this.carousel) return;
    
    const element = this.carousel.nativeElement;
    const tolerance = 5; // Add small tolerance for floating point precision
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    // Check if there's enough content to scroll
    if (maxScroll <= tolerance) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      return;
    }
    
    // With wrap-around, arrows should always be enabled if there's scrollable content
    this.canScrollLeft = true;
    this.canScrollRight = true;
  }

  // Helper method to check if carousel has scrollable content
  hasScrollableContent(): boolean {
    if (!this.carousel) return false;
    const element = this.carousel.nativeElement;
    return element.scrollWidth > element.clientWidth + 5; // 5px tolerance
  }

  trackByMovieId(index: number, movie: Movie): any {
    return movie.id;
  }
}
