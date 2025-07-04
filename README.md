# Important

- We need to wake up the Backend/Database before testing due to free tier limitations on Azure SQL

```
curl -X POST "https://be984984-aphkd5f2e7ake9ey.westeurope-01.azurewebsites.net/api/dev/reset-database" -H "accept: application/json" -d ""
```

or through /swagger

<img width="1465" alt="image" src="https://github.com/user-attachments/assets/8bb202f8-e5f9-4bb7-840c-6fce3a4f558a" />



  - or just keep refreshing the website it should load in around 2 minutes

## 🎬 Demo

Check out a video demonstration of the application:

[![SE3355 Movie Rating Website Demo](https://img.youtube.com/vi/34wobgofPR0/0.jpg)](https://www.youtube.com/watch?v=34wobgofPR0)

A modern, responsive movie rating and review platform built with Angular 20 and deployed on Azure Static Web Apps.

## 🚀 Live Deployment

### Frontend Application
- **Live URL**: https://thankful-cliff-012dd3803.1.azurestaticapps.net/

### Backend API
- **Live URL**: https://be984984-aphkd5f2e7ake9ey.westeurope-01.azurewebsites.net/
- **Repository**: https://github.com/emreutkan/se3355finalbackend

## 🎬 Project Overview

This is a full-featured movie database and rating application that allows users to discover movies, rate them, write reviews, and manage personal watchlists. The platform supports multiple languages and provides a seamless user experience with both local authentication and Google OAuth integration.

### Key Features

- **Movie Discovery**: Browse popular movies, search by title/director/actor
- **User Ratings & Reviews**: Rate movies (1-10 scale) and write detailed reviews
- **Personal Watchlist**: Save movies to watch later
- **User Authentication**: Local registration/login + Google OAuth
- **Internationalization**: Multi-language support (English/Turkish)
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Search**: Typeahead suggestions and advanced search capabilities



## 🏗️ Architecture & Design

### Frontend Architecture

The application follows Angular's recommended architecture patterns:

```
src/app/
├── features/           # Feature modules (lazy-loaded)
│   ├── auth/          # Authentication (login, register, OAuth)
│   ├── home/          # Home page with movie sliders
│   ├── movie/         # Movie details and ratings
│   ├── profile/       # User profile management
│   ├── search/        # Search functionality
│   └── watchlist/     # Personal watchlist
├── shared/            # Shared resources
│   ├── components/    # Reusable UI components
│   ├── services/      # Business logic and API calls
│   ├── guards/        # Route protection
│   ├── models/        # TypeScript interfaces
│   ├── pipes/         # Custom pipes
│   └── types/         # Type definitions
└── assets/            # Static resources
```

### Design Patterns Used

1. **Lazy Loading**: Feature modules are loaded on-demand to improve performance
2. **Reactive Programming**: Extensive use of RxJS Observables for state management
3. **Service-Oriented Architecture**: Clear separation between UI and business logic
4. **Component-Based Design**: Reusable components for consistent UI
5. **Guard Pattern**: Route protection using Angular guards
6. **Dependency Injection**: Angular's DI system for service management

### State Management

- **AuthService**: Manages user authentication state using BehaviorSubject
- **WatchlistService**: Handles watchlist state with reactive updates
- **LanguageService**: Manages internationalization state
- **LocalStorage**: Persists authentication tokens and user preferences

## 📊 Data Model

### Core Entities

#### Movie Model
```typescript
interface Movie {
  id: string;                    // UUID
  title: string;
  title_tr?: string;            // Turkish title
  original_title?: string;
  year: number;
  summary: string;
  summary_tr?: string;          // Turkish summary
  imdb_score: number;           // 0.0-10.0
  metascore?: number;
  trailer_url?: string;
  image_url?: string;
  runtime_min?: number;
  release_date?: string;        // ISO date
  language?: string;
  actors?: Actor[];
  categories?: string[];
  directors?: string[];
  writers?: string[];
  rating_count?: number;
  popularity?: PopularitySnapshot;
  rating_distribution?: RatingDistributionItem[];
}
```

#### User Model
```typescript
interface User {
  id: string;                   // UUID
  email: string;
  full_name: string;
  country?: string;
  city?: string;
  photo_url?: string;
  auth_provider: 'local' | 'google';
  created_at?: string;          // ISO datetime
}
```

#### Rating Model
```typescript
interface Rating {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;               // 1-10
  comment?: string;             // User review
  voter_country: string;
  created_at: string;
  updated_at?: string;
  user?: {
    full_name: string;
    country: string;
  };
}
```

### API Integration

The frontend communicates with a RESTful backend API hosted on Azure. All API calls are centralized in service classes that mirror backend functionality:

- **AuthService**: Authentication endpoints (`/auth/*`)
- **MovieService**: Movie data and ratings (`/movies/*`)
- **WatchlistService**: User watchlist management (`/users/me/watchlist/*`)

## 🛠️ Technical Stack

### Frontend
- **Angular 20**: Latest Angular framework with standalone components
- **TypeScript 5.8**: Strong typing and modern JavaScript features
- **RxJS 7.8**: Reactive programming for state management
- **CSS3**: Custom styling with responsive design

### Development Tools
- **Angular CLI**: Project scaffolding and build tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting

### Deployment
- **Azure Static Web Apps**: Hosting platform with CI/CD
- **Node.js 20**: Runtime environment
- **NPM**: Package management

## Assumptions & Design Decisions

### Authentication Strategy
- **JWT Tokens**: Used for API authentication with refresh token support
- **Google OAuth**: Implemented for social authentication to improve user experience

### Internationalization
- **Bilingual Support**: English and Turkish languages supported
- **Dynamic Content**: Movie titles and summaries can have language-specific versions
- **Fallback Strategy**: English content displayed when Turkish translation unavailable

### User Experience
- **Responsive Design**: breakpoints for different screen sizes
- **Progressive Enhancement**: Core functionality works without JavaScript (where possible)


## Problems Encountered & Solutions

### 1. Google OAuth Integration
**Problem**: Complex OAuth flow with Azure-hosted backend required careful configuration.
**Solution**:
- Implemented proper redirect URI handling
- Added comprehensive error handling for OAuth failures

### 2. State Management Complexity
**Problem**: Managing user state across multiple components became complex.
**Solution**:
- Implemented reactive state management using BehaviorSubjects
- Created centralized services for state management

