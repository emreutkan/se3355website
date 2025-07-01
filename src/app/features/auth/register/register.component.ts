import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FormatUtilsService } from '../../../shared/services/format-utils.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Country, LocationService } from '../../../shared/services/location.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private formatUtils = inject(FormatUtilsService);
  private locationService = inject(LocationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm!: FormGroup;
  errorMessage: string | null = null;
  passwordErrors: string[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  countries: Country[] = [];
  cities: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      country: [''],
      city: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      photo: [null]
    }, { validator: this.passwordMatchValidator });

    this.loadCountries();

    this.registerForm.get('country')?.valueChanges.subscribe(countryIso2 => {
      this.cities = [];
      this.registerForm.get('city')?.reset('');
      if (countryIso2) {
        this.loadCities(countryIso2);
      }
    });
  }

  get email() { return this.registerForm.get('email'); }
  get fullName() { return this.registerForm.get('fullName'); }
  get country() { return this.registerForm.get('country'); }
  get city() { return this.registerForm.get('city'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  passwordMatchValidator(group: FormGroup): null | { mismatch: boolean } {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  validatePassword(): void {
    const passwordControl = this.password;
    if (passwordControl) {
      const validationResult = this.formatUtils.validatePassword(passwordControl.value);
      this.passwordErrors = validationResult.errors;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validation = this.formatUtils.validatePhoto(file);
      if (validation.valid) {
        this.selectedFile = file;
        this.registerForm.patchValue({ photo: file });

        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.errorMessage = validation.error || 'Invalid file.';
        this.selectedFile = null;
        this.imagePreview = null;
        this.registerForm.patchValue({ photo: null });
      }
    }
  }

  loadCountries(): void {
    this.locationService.getCountries().subscribe(countries => {
      this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  loadCities(countryIso2: string): void {
    this.locationService.getCities(countryIso2).subscribe(cities => {
      this.cities = cities;
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { photo, ...formData } = this.registerForm.value;
    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.errorMessage = 'Registration failed';
        this.isLoading = false;
      },
    });
  }

  onFileChange(event: any): void {
    // ... existing code ...
  }
} 