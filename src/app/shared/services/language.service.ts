import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [language: string]: Translation;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Translations = {
    en: {
      // Header
      'header.search.placeholder': 'Search IMDb',
      'header.watchlist': 'Watchlist',
      'header.signin': 'Sign In',
      'header.movies': 'Movies',
      'header.tvshows': 'TV Shows',
      'header.celebrities': 'Celebrities',

      // Home page
      'home.popular': 'Popular Movies',
      'home.toprated': 'Top Rated Movies',
      'home.nowplaying': 'Now Playing',
      'home.upcoming': 'Upcoming Movies',
      'home.featured': 'Featured Movie',
      'home.watchtrailer': 'Watch Trailer',
      'home.addwatchlist': 'Add to Watchlist',
      'home.loading': 'Loading movies...',
      'home.viewall': 'View All',

      // Movie details
      'movie.director': 'Dir',
      'movie.cast': 'Cast',
      'movie.budget': 'Budget',
      'movie.boxoffice': 'Box Office',
      'movie.companies': 'Production Companies',
      'movie.countries': 'Countries',
      'movie.languages': 'Languages',
      'movie.status': 'Status',
      'movie.ratemovie': 'Rate Movie',

      // Search
      'search.all': 'All',
      'search.movies': 'Movies',
      'search.people': 'People',
      'search.noresults': 'No results found',
      'search.suggestions': 'Search suggestions',
      'search.viewall': 'View all results',

      // Auth
      'auth.signin': 'Sign In',
      'auth.signup': 'Sign Up',
      'auth.logout': 'Logout',
      'auth.signin.subtitle': 'Welcome back to IMDb',
      'auth.signup.subtitle': 'Join the world\'s most popular movie database',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.password.confirm': 'Confirm Password',
      'auth.country': 'Country',
      'auth.city': 'City',
      'auth.photo': 'Profile Photo',
      'auth.optional': 'Optional',
      'auth.or': 'or',
      'auth.google': 'Continue with Google',
      'auth.register.google': 'Register with Google',
      'auth.forgot.password': 'Forgot password?',
      'auth.no.account': 'Don\'t have an account?',
      'auth.have.account': 'Already have an account?',
      'auth.create.account': 'Create Account',
      'auth.signin.loading': 'Signing in...',
      'auth.signup.loading': 'Creating account...',
      'auth.email.placeholder': 'Enter your email',
      'auth.password.placeholder': 'Enter your password',
      'auth.password.confirm.placeholder': 'Confirm your password',
      'auth.country.select': 'Select Country',
      'auth.city.placeholder': 'Enter your city',
      'auth.photo.upload': 'Upload Photo',
      'auth.photo.hint': 'JPEG, PNG, WebP (max 5MB)',
      'auth.photo.remove': 'Remove photo',
      'auth.password.requirements': 'Password must contain:',
      'auth.password.requirement.length': 'At least 8 characters',
      'auth.password.requirement.number': 'At least one number',
      'auth.password.requirement.special': 'At least one special character',
      'auth.error.invalid': 'Invalid email or password',
      'auth.error.google': 'Authentication failed',
      'auth.error.registration': 'Registration failed. Please try again.',
      'auth.error.email.required': 'Email is required',
      'auth.error.password.required': 'Password is required',
      'auth.error.confirmPassword.required': 'Password confirmation is required',
      'auth.error.country.required': 'Country is required',
      'auth.error.city.required': 'City is required',
      'auth.error.email.invalid': 'Please enter a valid email',
      'auth.error.password.minlength': 'Password must be at least 8 characters',
      'auth.error.password.mismatch': 'Passwords do not match',
      'auth.error.city.minlength': 'City must be at least 2 characters'
    },
    tr: {
      // Header
      'header.search.placeholder': 'IMDb\'de Ara',
      'header.watchlist': 'İzleme Listesi',
      'header.signin': 'Giriş Yap',
      'header.movies': 'Filmler',
      'header.tvshows': 'TV Dizileri',
      'header.celebrities': 'Ünlüler',

      // Home page
      'home.popular': 'Popüler Filmler',
      'home.toprated': 'En Yüksek Puanlı Filmler',
      'home.nowplaying': 'Vizyonda',
      'home.upcoming': 'Yakında',
      'home.featured': 'Öne Çıkan Film',
      'home.watchtrailer': 'Fragmanı İzle',
      'home.addwatchlist': 'İzleme Listesine Ekle',
      'home.loading': 'Filmler yükleniyor...',
      'home.viewall': 'Tümünü Gör',

      // Movie details
      'movie.director': 'Yön',
      'movie.cast': 'Oyuncular',
      'movie.budget': 'Bütçe',
      'movie.boxoffice': 'Gişe',
      'movie.companies': 'Yapım Şirketleri',
      'movie.countries': 'Ülkeler',
      'movie.languages': 'Diller',
      'movie.status': 'Durum',
      'movie.ratemovie': 'Filmi Puanla',

      // Search
      'search.all': 'Tümü',
      'search.movies': 'Filmler',
      'search.people': 'Kişiler',
      'search.noresults': 'Sonuç bulunamadı',
      'search.suggestions': 'Arama önerileri',
      'search.viewall': 'Tüm sonuçları gör',

      // Auth
      'auth.signin': 'Giriş Yap',
      'auth.signup': 'Kayıt Ol',
      'auth.logout': 'Çıkış Yap',
      'auth.signin.subtitle': 'IMDb\'ye tekrar hoş geldiniz',
      'auth.signup.subtitle': 'Dünyanın en popüler film veritabanına katılın',
      'auth.email': 'E-posta',
      'auth.password': 'Şifre',
      'auth.password.confirm': 'Şifreyi Onayla',
      'auth.country': 'Ülke',
      'auth.city': 'Şehir',
      'auth.photo': 'Profil Fotoğrafı',
      'auth.optional': 'İsteğe bağlı',
      'auth.or': 'veya',
      'auth.google': 'Google ile Devam Et',
      'auth.register.google': 'Google ile Kayıt Ol',
      'auth.forgot.password': 'Şifrenizi mi unuttunuz?',
      'auth.no.account': 'Hesabınız yok mu?',
      'auth.have.account': 'Zaten hesabınız var mı?',
      'auth.create.account': 'Hesap Oluştur',
      'auth.signin.loading': 'Giriş yapılıyor...',
      'auth.signup.loading': 'Hesap oluşturuluyor...',
      'auth.email.placeholder': 'E-posta adresinizi girin',
      'auth.password.placeholder': 'Şifrenizi girin',
      'auth.password.confirm.placeholder': 'Şifrenizi onaylayın',
      'auth.country.select': 'Ülke Seçin',
      'auth.city.placeholder': 'Şehrinizi girin',
      'auth.photo.upload': 'Fotoğraf Yükle',
      'auth.photo.hint': 'JPEG, PNG, WebP (maks 5MB)',
      'auth.photo.remove': 'Fotoğrafı kaldır',
      'auth.password.requirements': 'Şifre şunları içermelidir:',
      'auth.password.requirement.length': 'En az 8 karakter',
      'auth.password.requirement.number': 'En az bir sayı',
      'auth.password.requirement.special': 'En az bir özel karakter',
      'auth.error.invalid': 'Geçersiz e-posta veya şifre',
      'auth.error.google': 'Kimlik doğrulama başarısız',
      'auth.error.registration': 'Kayıt başarısız. Lütfen tekrar deneyin.',
      'auth.error.email.required': 'E-posta gerekli',
      'auth.error.password.required': 'Şifre gerekli',
      'auth.error.confirmPassword.required': 'Şifre onayı gerekli',
      'auth.error.country.required': 'Ülke gerekli',
      'auth.error.city.required': 'Şehir gerekli',
      'auth.error.email.invalid': 'Lütfen geçerli bir e-posta girin',
      'auth.error.password.minlength': 'Şifre en az 8 karakter olmalı',
      'auth.error.password.mismatch': 'Şifreler eşleşmiyor',
      'auth.error.city.minlength': 'Şehir en az 2 karakter olmalı'
    }
  };

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Check if language is stored in localStorage
    const storedLanguage = localStorage.getItem('imdb-language');

    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'tr')) {
      this.setLanguage(storedLanguage);
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.toLowerCase();
      const language = browserLanguage.startsWith('tr') ? 'tr' : 'en';
      this.setLanguage(language);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: string): void {
    if (language === 'en' || language === 'tr') {
      this.currentLanguageSubject.next(language);
      localStorage.setItem('imdb-language', language);
    }
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang]?.[key] || key;
  }

  // Get all translations for current language
  getTranslations(): Translation {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang] || this.translations['en'];
  }

  // Get supported languages
  getSupportedLanguages(): Array<{code: string, name: string, flag: string}> {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
    ];
  }
}
