# 🎬 Movie Rating Application

A modern, responsive movie rating and review platform built with Angular 20. Users can discover movies, rate them, write reviews, and manage their personal watchlists.

## 🌟 Features

### 🎭 Core Features
- **Movie Discovery**: Browse and discover movies with detailed information
- **Movie Ratings**: Rate movies on a 1-10 scale with star-based UI
- **User Reviews**: Write and edit detailed movie reviews (200-word limit)
- **Personal Watchlist**: Add/remove movies from your personal watchlist
- **Movie Search**: Search for movies by title, genre, or other criteria
- **User Authentication**: Secure login/registration with Google OAuth integration

### 🎨 User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Modern UI**: Clean, cinematic interface with blurred background effects
- **Interactive Components**: Star ratings, movie sliders, and smooth animations
- **WCAG 2.1 Compliant**: Full accessibility support with screen reader compatibility
- **Multi-language Support**: Built-in internationalization (i18n) ready
- **Dark Theme**: Cinematic dark theme throughout the application

### 📊 Movie Information
- **IMDb Integration**: Display IMDb ratings and vote counts
- **Movie Details**: Runtime, release year, genres, and plot summaries
- **High-Quality Images**: Movie posters and backdrop images
- **Rating Distribution**: Visual charts showing rating breakdowns
- **Country-based Filtering**: Filter reviews by user location

## 🚀 Technologies Used

### Frontend
- **Angular 20** - Latest Angular framework
- **TypeScript 5.8** - Type-safe development
- **RxJS 7.8** - Reactive programming
- **Angular Router** - Client-side navigation
- **Angular Forms** - Reactive form handling
- **FontAwesome 6.7** - Icon library

### Development Tools
- **Angular CLI 20** - Project scaffolding and build tools
- **ESLint 9.29** - Code linting and quality
- **Prettier** - Code formatting
- **Karma & Jasmine** - Unit testing framework
- **TypeScript ESLint** - TypeScript-specific linting

### Backend Integration
- RESTful API integration
- JWT authentication
- HTTP interceptors for API communication

## 📁 Project Structure

```
src/
├── app/
│   ├── features/                 # Feature modules
│   │   ├── auth/                 # Authentication (login, register, OAuth)
│   │   ├── home/                 # Home page with movie discovery
│   │   ├── movie/                # Movie details and ratings
│   │   ├── search/               # Movie search functionality
│   │   └── watchlist/            # Personal watchlist management
│   ├── shared/                   # Shared components and services
│   │   ├── components/           # Reusable UI components
│   │   │   ├── header/           # Navigation header
│   │   │   ├── movie-card/       # Movie display card
│   │   │   └── movie-slider/     # Featured movie carousel
│   │   ├── guards/               # Route guards
│   │   ├── models/               # TypeScript interfaces
│   │   ├── pipes/                # Custom pipes
│   │   ├── services/             # Business logic services
│   │   └── types/                # Type definitions
│   └── assets/                   # Static assets
├── styles.css                    # Global styles
└── index.html                    # Application entry point
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v20.19.0 or higher, or v22.12.0+, or v24.0.0+)
- **npm** (v8.0.0 or higher)
- **Angular CLI** (v20.0.0 or higher)

> ⚠️ **Important**: Angular 20 requires Node.js v20.19+ or v22.12+ or v24.0+. Earlier versions (including v18.x) are not supported.

### Installation Steps

1. **Verify Node.js version**
   ```bash
   node --version
   # Should show v20.19.0+ or v22.12.0+ or v24.0.0+
   ```

2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd se3355website
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Install Angular CLI globally** (if not already installed)
   ```bash
   npm install -g @angular/cli@20
   ```

5. **Environment Configuration**
   Create environment files in `src/environments/`:
   ```typescript
   // environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api',
     tmdbApiKey: 'your-tmdb-api-key'
   };
   ```

6. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

7. **Open the application**
   Navigate to `http://localhost:4200`

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 4200 |
| `npm run build` | Build the project for production |
| `npm run watch` | Build and watch for changes |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Run ESLint for code quality |

## 🎨 Key Components

### Movie Slider
- Cinematic movie carousel with blurred backgrounds
- Interactive navigation controls
- Responsive design for all screen sizes
- Smooth transitions and hover effects

### Movie Rating System
- Interactive star-based rating (1-10 scale)
- Real-time form validation
- Word count limits for reviews (200 words)
- Edit existing ratings and reviews

### Watchlist Management
- Add/remove movies from personal lists
- Visual feedback for watchlist status
- Persistent storage across sessions

### Authentication
- Secure login/registration forms
- Google OAuth integration
- JWT token management
- Protected route guards

## 🔧 Configuration

### API Integration
The application expects a backend API with the following endpoints:

```
GET    /api/movies              # Get movies list
GET    /api/movies/:id          # Get movie details
GET    /api/movies/:id/ratings  # Get movie ratings
POST   /api/movies/:id/ratings  # Submit movie rating
GET    /api/movies/:id/ratings/me # Get user's rating
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
GET    /api/auth/google/callback # Google OAuth callback
```

### Build Configuration
- **Development**: Source maps enabled, no optimization
- **Production**: Optimized bundles, hash-based caching
- **Bundle Budgets**: 500kB initial, 4kB per component style

## 🎭 Features in Detail

### Rating & Review System
- **Star Rating**: Interactive 1-10 star system
- **Review Writing**: Rich text reviews with word limits
- **Review Editing**: Update existing reviews (replaces previous)
- **Validation**: Real-time word count and form validation
- **Visual Feedback**: Color-coded validation states

### Movie Discovery
- **Featured Movies**: Rotating carousel of popular movies
- **Search Functionality**: Find movies by various criteria
- **Detailed Information**: IMDb ratings, runtime, genres, cast
- **High-Quality Imagery**: Posters and backdrop images

### User Experience
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Screen reader support, keyboard navigation
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages
- **Internationalization**: Ready for multiple languages

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Build Artifacts
- Output directory: `dist/se3355website/`
- Optimized bundles with hash-based caching
- Compressed assets for faster loading

### Azure Static Web Apps Deployment

#### Node.js Version Configuration
Create `.nvmrc` file in the project root to specify Node.js version:
```
20.19.0
```

Or add to your workflow file:
```yaml
# .github/workflows/azure-static-web-apps-*.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.19.0'
```

#### Build Configuration
Create `staticwebapp.config.json` in the project root:
```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

#### Troubleshooting Deployment
If you encounter Node.js version errors:
1. Update your GitHub Actions workflow to use Node.js 20.19+
2. Ensure `.nvmrc` file specifies the correct version
3. Clear Azure build cache if needed

### Environment Variables
Configure production environment in `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  tmdbApiKey: 'your-production-api-key'
};
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
ng test

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Quality

- **ESLint**: Enforced code style and quality
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety throughout
- **Angular Style Guide**: Following official Angular conventions

## 🐛 Known Issues

- CSS bundle size warnings (due to comprehensive styling)
- Requires backend API for full functionality

### Azure Static Web Apps Deployment Issues

**Node.js Version Error**:
```
The Angular CLI requires a minimum Node.js version of v20.19 or v22.12
```

**Solution**:
1. Ensure `.nvmrc` file contains `20.19.0`
2. Update GitHub Actions workflow to use Node.js 20.19+
3. Check `package.json` engines field specifies correct Node.js version
4. Clear Azure build cache in Azure portal if needed

**Example workflow fix**:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
```

## 📄 License

This project is part of the SE3355 course. All rights reserved.

## 👥 Authors

- **Course**: SE3355 - Software Engineering
- **Framework**: Angular 20
- **UI/UX**: Modern cinematic design

## 🔮 Future Enhancements

- Movie recommendations based on ratings
- Social features (follow users, share reviews)
- Advanced filtering and sorting options
- Offline support with PWA features
- Real-time notifications
- Movie trailers integration

---

Built with ❤️ using Angular 20 and modern web technologies.
