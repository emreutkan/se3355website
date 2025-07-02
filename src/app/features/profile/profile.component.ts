import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { User, UserProfile } from '../../shared/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  profileForm: FormGroup;
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;
  isEditing = false;

  // File upload handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Countries and cities data
  countries: { code: string; name: string }[] = [
    { code: 'US', name: 'United States' },
    { code: 'TR', name: 'Turkey' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
  ];

  constructor() {
    this.profileForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      city: [''],
      country: [''],
      photo_url: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;

    // Get user profile with statistics
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.userProfile = response.profile;
        this.populateForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.error = 'Failed to load profile information';
        this.isLoading = false;
        
        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  private populateForm(): void {
    if (this.userProfile) {
      this.profileForm.patchValue({
        full_name: this.userProfile.full_name || '',
        city: this.userProfile.city || '',
        country: this.userProfile.country || '',
        photo_url: this.userProfile.photo_url || ''
      });
      
      this.imagePreview = this.userProfile.photo_url || null;
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEditing(): void {
    this.isEditing = !this.isEditing;
    this.error = null;
    this.successMessage = null;
    
    if (!this.isEditing) {
      // Reset form when canceling
      this.populateForm();
      this.selectedFile = null;
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isSaving) {
      this.isSaving = true;
      this.error = null;
      this.successMessage = null;

      const formData = this.profileForm.value;
      
      // Handle file upload if selected
      if (this.selectedFile) {
        // In a real app, you would upload the file to a service first
        // For now, we'll use a placeholder URL
        formData.photo_url = this.imagePreview;
      }

      this.userService.updateUserProfile(formData).subscribe({
        next: (response) => {
          this.userProfile = { ...this.userProfile, ...response.profile };
          this.successMessage = 'Profile updated successfully!';
          this.isEditing = false;
          this.isSaving = false;
          this.selectedFile = null;
          
          // Update auth service with new user data
          this.authService.updateCurrentUser(this.userProfile as User);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.error = error.error?.msg || 'Failed to update profile';
          this.isSaving = false;
        }
      });
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getCountryName(code: string): string {
    const country = this.countries.find(c => c.code === code);
    return country?.name || code;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = `https://via.placeholder.com/120x120/1a1a1a/f5c518?text=${this.getInitials(this.userProfile?.full_name || 'U')}`;
    }
  }

  // Form validation helpers
  get fullNameError(): string | null {
    const control = this.profileForm.get('full_name');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'Full name is required';
      if (control.errors?.['minlength']) return 'Full name must be at least 2 characters';
    }
    return null;
  }
} 