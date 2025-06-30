import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchResultsComponent } from './components/search-results.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: SearchResultsComponent }
    ])
  ],
  declarations: []
})
export class SearchModule { } 