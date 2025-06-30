import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../shared/services/movie.service';
import { Movie } from '../../../../shared/models/movie.model';
import { MovieCardComponent } from '../../../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-popular-movies',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './popular-movies.component.html',
  styleUrl: './popular-movies.component.css'
})
export class PopularMoviesComponent implements OnInit {
  popularMovies: Movie[] = [];
  loading = true;
  error: string | null = null;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  loadPopularMovies(): void {
    this.loading = true;
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.popularMovies = movies.movies || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load popular movies';
        this.loading = false;
        console.error('Error loading popular movies:', error);
      }
    });
  }

  trackByMovieId(index: number, movie: Movie): any {
    return movie.id;
  }
}
