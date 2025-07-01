import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class PopularMoviesComponent implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  popularMovies: Movie[] = [];
  loading = true;
  error: string | null = null;
  canScrollLeft = false;
  canScrollRight = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  ngAfterViewInit(): void {
    if (this.carousel) {
      this.updateScrollButtons();
      this.carousel.nativeElement.addEventListener('scroll', () => {
        this.updateScrollButtons();
      });
    }
  }

  loadPopularMovies(): void {
    this.loading = true;
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.popularMovies = movies.movies || [];
        this.loading = false;
        setTimeout(() => {
          this.updateScrollButtons();
        }, 100);
      },
      error: (error) => {
        this.error = 'Failed to load popular movies';
        this.loading = false;
        console.error('Error loading popular movies:', error);
      }
    });
  }

  scrollLeft(): void {
    if (this.carousel) {
      const scrollAmount = 204 * 3; // 3 cards (180px + 24px gap)
      this.carousel.nativeElement.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  scrollRight(): void {
    if (this.carousel) {
      const scrollAmount = 204 * 3; // 3 cards (180px + 24px gap)
      this.carousel.nativeElement.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  private updateScrollButtons(): void {
    if (this.carousel) {
      const element = this.carousel.nativeElement;
      this.canScrollLeft = element.scrollLeft > 0;
      this.canScrollRight = element.scrollLeft < (element.scrollWidth - element.clientWidth);
    }
  }

  trackByMovieId(index: number, movie: Movie): any {
    return movie.id;
  }
}
