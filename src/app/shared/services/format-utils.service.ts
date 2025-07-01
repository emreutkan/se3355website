// format-utils.service.ts - Business logic utility service

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatUtilsService {

  // ===== RATING UTILITIES =====
  formatRating(rating: number): string {
    return `${rating}/10`;
  }

  validateRating(rating: number): boolean {
    return rating >= 1 && rating <= 10 && Number.isInteger(rating);
  }

  convertRatingScale(value: number, fromScale = 5, toScale = 10): number {
    return Math.round((value / fromScale) * toScale);
  }

  calculateAverageRating(ratings: number[]): number {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, cur) => acc + cur, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  // ===== DATE UTILITIES =====
  formatReleaseDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // ===== MOVIE UTILITIES =====
  formatRuntime(minutes: number): string {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  getImageUrl(url: string): string {
    return url || '/assets/images/no-image.png';
  }

  getPosterUrl(imageUrl: string): string {
    return this.getImageUrl(imageUrl);
  }

  // ===== VALIDATION UTILITIES =====
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validatePhoto(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { valid: true };
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateCountryCode(country: string): boolean {
    return /^[A-Z]{2}$/.test(country);
  }
} 