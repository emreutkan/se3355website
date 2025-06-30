import { Component, OnInit, inject } from '@angular/core';
import { WatchlistService, WatchlistItem } from '../../shared/services/watchlist.service';
import { Observable } from 'rxjs';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, RouterLink],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  private watchlistService = inject(WatchlistService);

  watchlist$: Observable<WatchlistItem[]>;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.watchlist$ = this.watchlistService.watchlist$;
  }

  ngOnInit(): void {
  }

  removeFromWatchlist(movieId: string): void {
    this.watchlistService.toggleWatchlist(movieId).subscribe();
  }
} 