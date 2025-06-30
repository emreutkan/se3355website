import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../../shared/services/movie.service';
import { Movie } from '../../../shared/models/movie.model';
import { CommonModule, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { WatchlistService } from '../../../shared/services/watchlist.service';
import { Observable, of } from 'rxjs';
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgForOf, DecimalPipe],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private watchlistService = inject(WatchlistService);
  private authService = inject(AuthService);

  movie: Movie | null = null;
  isInWatchlist$: Observable<boolean> = of(false);
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getMovieDetails(movieId).subscribe(movie => {
        this.movie = movie;
        this.isInWatchlist$ = this.watchlistService.isMovieInWatchlist(this.movie.id);
      });
    }
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