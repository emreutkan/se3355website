import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../shared/services/movie.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FormatUtilsService } from '../../../shared/services/format-utils.service';
import { Movie, Rating } from '../../../shared/models/movie.model';
import { RatingsResponse } from '../../../shared/models/api-response.model';
import { Observable, BehaviorSubject } from 'rxjs';

interface RatingDistribution {
  rating: number;
  percentage: number;
  votes: string;
}

@Component({
  selector: 'app-movie-ratings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './movie-ratings.component.html',
  styleUrls: ['./movie-ratings.component.css']
})
export class MovieRatingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private authService = inject(AuthService);
  private formatUtils = inject(FormatUtilsService);
  private fb = inject(FormBuilder);

  // ONLY UI state - NO business logic
  movie$ = new BehaviorSubject<Movie | null>(null);
  ratings$ = new BehaviorSubject<Rating[]>([]);
  currentUser$ = this.authService.currentUser$;
  
  // Rating form - NO business logic
  ratingForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    comment: ['']
  });
  
  // UI state
  selectedCountry = 'all';
  availableCountries: string[] = [];
  ratingDistribution: RatingDistribution[] = [];
  isSubmittingRating = false;

  ngOnInit(): void {
    // NO business logic - just coordinate service calls
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(movieId);
      this.loadRatings(movieId);
    }
  }

  // NO business logic - delegate to service
  onSubmitRating(): void {
    if (this.ratingForm.valid && !this.isSubmittingRating) {
      const movieId = this.route.snapshot.paramMap.get('id');
      if (!movieId) return;

      this.isSubmittingRating = true;
      const { rating, comment } = this.ratingForm.value;
      
      this.movieService.rateMovie(movieId, rating, comment).subscribe({
        next: () => {
          this.ratingForm.reset();
          this.loadRatings(movieId); // Refresh ratings
          this.isSubmittingRating = false;
        },
        error: (error) => {
          this.handleError(error);
          this.isSubmittingRating = false;
        }
      });
    }
  }

  onCountryChange(): void {
    this.calculateRatingDistribution();
  }

  // DELEGATE formatting to FormatUtilsService
  formatDate(dateString: string): string {
    return this.formatUtils.formatReleaseDate(dateString);
  }

  formatRating(rating: number): string {
    return this.formatUtils.formatRating(rating);
  }

  validateRating(rating: number): boolean {
    return this.formatUtils.validateRating(rating);
  }

  // NO business logic - just UI coordination
  private loadMovieDetails(movieId: string): void {
    this.movieService.getMovieDetail(movieId).subscribe({
      next: (movie: Movie) => this.movie$.next(movie),
      error: (error) => this.handleError(error)
    });
  }

  private loadRatings(movieId: string, page = 1): void {
    this.movieService.getMovieRatings(movieId, page).subscribe({
      next: (response: RatingsResponse) => {
        this.ratings$.next(response.ratings);
        this.setupCountries(response.distribution);
        this.calculateRatingDistribution();
      },
      error: (error) => this.handleError(error)
    });
  }

  private setupCountries(distribution: any[]): void {
    this.availableCountries = distribution.map(d => d.country);
  }

  private calculateRatingDistribution(): void {
    // This would ideally come from the backend service
    // For now, generate mock data
    this.ratingDistribution = [];
    
    for (let rating = 10; rating >= 1; rating--) {
      const percentage = Math.random() * 20; // Mock percentages
      const votes = Math.floor(percentage * 100);
      
      this.ratingDistribution.push({
        rating,
        percentage,
        votes: this.formatVotes(votes)
      });
    }
  }

  private formatVotes(votes: number): string {
    if (votes >= 1000000) {
      return `${(votes / 1000000).toFixed(1)}M`;
    } else if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}K`;
    } else {
      return votes.toString();
    }
  }

  private handleError(error: any): void {
    console.error('MovieRatingsComponent error:', error);
    // Handle error display in UI
  }
}
