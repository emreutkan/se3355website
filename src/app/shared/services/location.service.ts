import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Country {
  name: string;
  iso2: string;
  cities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);

  private dataUrl = '/assets/data/countries-cities.json';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() { }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.dataUrl);
  }

  getCities(countryIso2: string): Observable<string[]> {
    return this.http.get<Country[]>(this.dataUrl).pipe(
      map(countries => {
        const country = countries.find(c => c.iso2 === countryIso2);
        return country ? country.cities.sort() : [];
      })
    );
  }
} 