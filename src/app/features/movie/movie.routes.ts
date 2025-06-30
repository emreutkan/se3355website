import { Routes } from '@angular/router';
import { MovieDetailsComponent } from './movie-details/movie-details.component';

export const MOVIE_ROUTES: Routes = [
  {
    path: ':id',
    component: MovieDetailsComponent
  }
]; 