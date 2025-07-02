import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MovieRatingsComponent } from './features/movie/movie-ratings/movie-ratings.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'movie',
    loadChildren: () => import('./features/movie/movie.routes').then(m => m.MOVIE_ROUTES)
  },
  {
    path: 'watchlist',
    loadChildren: () => import('./features/watchlist/watchlist.routes').then(m => m.WATCHLIST_ROUTES)
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'ratings/:id',
    component: MovieRatingsComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
