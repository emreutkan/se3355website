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
  // Add more feature modules here as needed
];
