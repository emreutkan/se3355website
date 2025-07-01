import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../shared/services/movie.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Movie } from '../../../shared/models/movie.model';
import { GetMovieRatingsResponse } from '../../../shared/types/api.responses';
import { Observable } from 'rxjs';

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
  private fb = inject(FormBuilder);

  movie: Movie | null = null;
  movieRatings: GetMovieRatingsResponse | null = null;
  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  
  // Rating form
  ratingForm: FormGroup;
  selectedRating = 0;
  hoverRatingValue = 0;
  isSubmittingRating = false;
  
  // Distribution
  selectedCountry = 'all';
  availableCountries: string[] = [];
  ratingDistribution: RatingDistribution[] = [];

  constructor() {
    this.ratingForm = this.fb.group({
      comment: ['']
    });
  }

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(movieId);
      this.loadRatings();
    }
  }

  private loadMovieDetails(movieId: string): void {
    this.movieService.getMovieDetails(movieId).subscribe(movie => {
      this.movie = movie;
    });
  }

  loadRatings(page = 1): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getMovieRatings(movieId, page).subscribe(response => {
        this.movieRatings = response;
        this.setupCountries();
        this.calculateRatingDistribution();
      });
    }
  }

  private setupCountries(): void {
    if (this.movieRatings?.distribution) {
      this.availableCountries = this.movieRatings.distribution.map(d => d.country);
    }
  }

  selectRating(rating: number): void {
    this.selectedRating = rating;
  }

  hoverRating(rating: number): void {
    this.hoverRatingValue = rating;
  }

  onSubmitRating(): void {
    if (!this.selectedRating || this.isSubmittingRating) return;
    
    const movieId = this.route.snapshot.paramMap.get('id');
    if (!movieId) return;

    this.isSubmittingRating = true;
    
    const ratingData = {
      rating: this.selectedRating,
      comment: this.ratingForm.get('comment')?.value || undefined
    };

    this.movieService.submitRating(movieId, ratingData).subscribe({
      next: (response) => {
        console.log('Rating submitted successfully:', response);
        this.resetForm();
        this.loadRatings(); // Reload ratings to show the new one
        this.isSubmittingRating = false;
      },
      error: (error) => {
        console.error('Error submitting rating:', error);
        this.isSubmittingRating = false;
      }
    });
  }

  resetForm(): void {
    this.selectedRating = 0;
    this.hoverRatingValue = 0;
    this.ratingForm.reset();
  }

  getCharacterCount(): number {
    return this.ratingForm.get('comment')?.value?.length || 0;
  }

  onCountryChange(): void {
    this.calculateRatingDistribution();
  }

  private calculateRatingDistribution(): void {
    if (!this.movieRatings) return;

    if (this.selectedCountry === 'all') {
      // Calculate overall distribution
      const totalVotes = this.movieRatings.distribution.reduce((sum, d) => sum + d.votes, 0);
      this.generateDistributionBars(totalVotes);
    } else {
      // Calculate for specific country
      const countryData = this.movieRatings.distribution.find(d => d.country === this.selectedCountry);
      if (countryData) {
        this.generateDistributionBars(countryData.votes);
      }
    }
  }

  private generateDistributionBars(totalVotes: number): void {
    // Generate mock distribution data (in real app, this would come from API)
    this.ratingDistribution = [];
    
    for (let rating = 10; rating >= 1; rating--) {
      const percentage = Math.random() * 20; // Mock percentages
      const votes = Math.floor((percentage / 100) * totalVotes);
      
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

  getStarArray(rating: number): string[] {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    const stars: string[] = [];
    for (let i = 0; i < fullStars; i++) stars.push('filled');
    if (halfStar) stars.push('half');
    for (let i = 0; i < emptyStars; i++) stars.push('empty');
    
    return stars;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
