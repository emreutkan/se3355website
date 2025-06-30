import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
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
    path: '**',
    redirectTo: ''
  }
];
