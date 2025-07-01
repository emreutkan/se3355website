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
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface RatingDistribution {
  rating: number;
  percentage: number;
  count: number;
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

  // State management
  movie$ = new BehaviorSubject<Movie | null>(null);
  ratingsData$ = new BehaviorSubject<RatingsResponse | null>(null);
  currentUser$ = this.authService.currentUser$;
  isLoggedIn$ = this.authService.isLoggedIn$;
  
  // Rating form state
  ratingForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
    comment: ['', [Validators.maxLength(500)]]
  });
  
  // UI state for star rating
  selectedRating = 0;
  hoverRating = 0;
  
  // UI state
  selectedCountry = 'All Countries';
  availableCountries: string[] = ['All Countries'];
  ratingDistribution: RatingDistribution[] = [];
  isSubmittingRating = false;
  currentPage = 1;
  movieId: string | null = null;

  // Computed observables
  ratings$ = this.ratingsData$.pipe(
    map(data => data?.ratings || [])
  );

  totalRatings$ = this.ratingsData$.pipe(
    map(data => data?.pagination?.total || 0)
  );

  ngOnInit(): void {
    this.movieId = this.route.snapshot.paramMap.get('id');
    if (this.movieId) {
      this.loadMovieDetails(this.movieId);
      this.loadRatings(this.movieId, 1);
    }
  }

  // Star rating methods
  selectRating(rating: number): void {
    this.selectedRating = rating;
    this.ratingForm.patchValue({ rating });
  }

  hoverRatingValue(rating: number): void {
    this.hoverRating = rating;
  }

  resetHover(): void {
    this.hoverRating = 0;
  }

  // Form methods
  onSubmitRating(): void {
    if (this.ratingForm.valid && !this.isSubmittingRating && this.movieId) {
      this.isSubmittingRating = true;
      const { rating, comment } = this.ratingForm.value;
      
      this.movieService.rateMovie(this.movieId, rating, comment).subscribe({
        next: () => {
          this.resetForm();
          // Refresh ratings to show the new comment
          this.loadRatings(this.movieId!, this.currentPage);
          this.isSubmittingRating = false;
        },
        error: (error) => {
          this.handleError(error);
          this.isSubmittingRating = false;
        }
      });
    }
  }

  resetForm(): void {
    this.ratingForm.reset();
    this.selectedRating = 0;
    this.hoverRating = 0;
  }

  getCharacterCount(): number {
    return this.ratingForm.get('comment')?.value?.length || 0;
  }

  // Pagination methods
  loadPage(page: number): void {
    if (this.movieId) {
      this.currentPage = page;
      this.loadRatings(this.movieId, page);
    }
  }

  // Country filter (if distribution data is available)
  onCountryChange(): void {
    this.calculateRatingDistribution();
  }

  // Utility methods
  formatDate(dateString: string): string {
    return this.formatUtils.formatReleaseDate(dateString);
  }

  formatRating(rating: number): string {
    return this.formatUtils.formatRating(rating);
  }

  getStarArray(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('filled');
    }
    if (hasHalfStar) {
      stars.push('half');
    }
    while (stars.length < 10) {
      stars.push('empty');
    }
    return stars;
  }

  formatVotes(votes: number): string {
    if (votes >= 1000000) {
      return `${(votes / 1000000).toFixed(1)}M`;
    } else if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}K`;
    } else {
      return votes.toString();
    }
  }

  // Private methods
  private loadMovieDetails(movieId: string): void {
    this.movieService.getMovieDetail(movieId).subscribe({
      next: (movie: Movie) => this.movie$.next(movie),
      error: (error) => this.handleError(error)
    });
  }

  private loadRatings(movieId: string, page = 1): void {
    this.movieService.getMovieRatings(movieId, page, 20).subscribe({
      next: (response: RatingsResponse) => {
        this.ratingsData$.next(response);
        this.setupCountries(response.distribution);
        this.calculateRatingDistribution();
      },
      error: (error) => this.handleError(error)
    });
  }

  private setupCountries(distribution: any[]): void {
    if (distribution && distribution.length > 0) {
      this.availableCountries = ['All Countries', ...distribution.map(d => d.country)];
    }
  }

  private calculateRatingDistribution(): void {
    const ratingsData = this.ratingsData$.value;
    if (!ratingsData || !ratingsData.distribution) {
      // Generate mock distribution if no data available
      this.generateMockDistribution();
      return;
    }

    // Calculate distribution from actual data
    const distribution = ratingsData.distribution;
    const selectedData = this.selectedCountry === 'All Countries' 
      ? distribution 
      : distribution.filter(d => d.country === this.selectedCountry);

    this.ratingDistribution = [];
    const totalVotes = selectedData.reduce((sum, d) => sum + d.votes, 0);

    for (let rating = 10; rating >= 1; rating--) {
      const countryData = selectedData.find(d => Math.floor(d.avg_rating) === rating);
      const votes = countryData ? countryData.votes : 0;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      
      this.ratingDistribution.push({
        rating,
        percentage,
        count: votes,
        votes: this.formatVotes(votes)
      });
    }
  }

  private generateMockDistribution(): void {
    // Generate mock data when no distribution data is available
    this.ratingDistribution = [];
    const mockData = [
      { rating: 10, percentage: 55.0, count: 1700000 },
      { rating: 9, percentage: 25.8, count: 789000 },
      { rating: 8, percentage: 11.8, count: 360000 },
      { rating: 7, percentage: 3.7, count: 114000 },
      { rating: 6, percentage: 1.1, count: 34000 },
      { rating: 5, percentage: 0.6, count: 17000 },
      { rating: 4, percentage: 0.3, count: 8200 },
      { rating: 3, percentage: 0.2, count: 6000 },
      { rating: 2, percentage: 0.2, count: 5600 },
      { rating: 1, percentage: 1.4, count: 44000 }
    ];

    this.ratingDistribution = mockData.map(item => ({
      ...item,
      votes: this.formatVotes(item.count)
    }));
  }

  private handleError(error: any): void {
    console.error('MovieRatingsComponent error:', error);
    // Handle error display in UI if needed
  }
}
