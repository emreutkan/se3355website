import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../../shared/services/movie.service';
import { Movie, RatingDistributionItem } from '../../../shared/models/movie.model';

interface RatingDistribution {
  rating: number;
  percentage: number;
  votes: string;
}

@Component({
  selector: 'app-movie-ratings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-ratings.component.html',
  styleUrls: ['./movie-ratings.component.css']
})
export class MovieRatingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);

  movie: Movie | null = null;
  countries: string[] = [];
  selectedCountry = '';
  ratingDistribution: RatingDistribution[] = [];
  unweightedMean = 0;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getMovieDetails(movieId).subscribe(movie => {
        this.movie = movie;
        this.countries = ['All', ...(movie.rating_distribution?.map(d => d.country) || [])];
        if (this.countries.length > 0) {
          this.selectCountry(this.countries[0]);
        }
      });
    }
  }

  selectCountry(country: string): void {
    this.selectedCountry = country;
    
    if (!this.movie?.rating_distribution) {
      this.ratingDistribution = [];
      this.unweightedMean = 0;
      return;
    }

    if (country === 'All') {
      const totalVotes = this.movie.rating_distribution.reduce((sum, d) => sum + d.votes, 0);
      const weightedSum = this.movie.rating_distribution.reduce((sum, d) => sum + (d.avg_rating * d.votes), 0);
      const overallAverage = totalVotes > 0 ? weightedSum / totalVotes : 0;
      
      this.unweightedMean = Math.round(overallAverage * 10) / 10;
      this.ratingDistribution = this.generateRatingDistribution(overallAverage, totalVotes);
    } else {
      const countryData = this.movie.rating_distribution.find(d => d.country === country);
      
      if (!countryData) {
        this.ratingDistribution = [];
        this.unweightedMean = 0;
        return;
      }

      this.unweightedMean = countryData.avg_rating;

      this.ratingDistribution = this.generateRatingDistribution(countryData.avg_rating, countryData.votes);
    }
  }

  private generateRatingDistribution(avgRating: number, totalVotes: number): RatingDistribution[] {
    const distribution: RatingDistribution[] = [];
    
    const ratings = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    
    const voteDistribution: { [key: number]: number } = {};
    let totalCalculatedVotes = 0;
    
    ratings.forEach(rating => {
      const distance = Math.abs(rating - avgRating);
      
      let voteProbability = Math.exp(-distance * 0.8);
      
      if (distance <= 1) {
        voteProbability *= (0.8 + Math.random() * 0.4);
      } else if (distance <= 2) {
        voteProbability *= (0.3 + Math.random() * 0.4);
      } else {
        voteProbability *= (0.1 + Math.random() * 0.2);
      }
      
      const votes = Math.round(voteProbability * totalVotes * 0.15);
      
      voteDistribution[rating] = votes;
      totalCalculatedVotes += votes;
    });
    
    const scaleFactor = totalVotes / Math.max(totalCalculatedVotes, 1);
    
    ratings.forEach(rating => {
      const adjustedVotes = Math.round(voteDistribution[rating] * scaleFactor);
      const percentage = totalVotes > 0 ? (adjustedVotes / totalVotes) * 100 : 0;
      
      distribution.push({
        rating,
        percentage: Math.round(percentage * 10) / 10,
        votes: this.formatVotes(adjustedVotes)
      });
    });
    
    return distribution;
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
}
