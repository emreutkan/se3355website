import { Routes } from '@angular/router';
import { WatchlistComponent } from './watchlist.component';
import { authGuard } from '../../shared/guards/auth.guard';

export const WATCHLIST_ROUTES: Routes = [
  {
    path: '',
    component: WatchlistComponent,
    canActivate: [authGuard]
  }
]; 