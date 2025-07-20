# Nutrition Tracker - Architecture Analysis & Documentation

> **Version**: 1.0
> **Last Updated**: 2025-04-19
> **Project**: Nutrition Tracker (FitnessGeek predecessor)
> **Status**: Active development with production deployment

---

## 🏗️ Project Overview

The Nutrition Tracker is a comprehensive mobile-friendly nutrition tracking application that serves as the foundation for the FitnessGeek project. It provides food logging, calorie tracking, fitness integration, and data synchronization capabilities.

### Core Features

- **Food Database Integration** - Search and browse comprehensive food database
- **Barcode Scanning** - Quick food addition via product barcodes
- **Food Logging** - Daily food intake tracking with intuitive interface
- **Nutrition Goals** - Calorie and macronutrient goal setting and monitoring
- **Progress Tracking** - Nutrition history with charts and summaries
- **Garmin Connect Integration** - Fitness data synchronization
- **Data Synchronization** - Cross-device data sync
- **User Authentication** - JWT-based secure authentication
- **Recipe Management** - Create and manage custom recipes
- **Weight Tracking** - Comprehensive weight monitoring
- **Blood Pressure Logging** - Health metric tracking
- **Meal Planning** - Advanced meal planning capabilities

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React Native with Expo (web-optimized)
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: React Context + AsyncStorage
- **Build Tool**: Expo CLI
- **PWA Support**: Service Worker registration

### Backend
- **Runtime**: Node.js with Express
- **Language**: JavaScript/TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Caching**: Redis (optional)
- **Logging**: Custom logger with Morgan
- **Validation**: Express-validator

### External Integrations
- **Food Database**: OpenFoodFacts API
- **Fitness Data**: Garmin Connect API (Python integration)
- **Barcode Scanning**: Multiple scanner implementations
- **Caching**: Redis for performance optimization

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Database**: PostgreSQL with connection pooling
- **Deployment**: Remote server (192.168.1.17)

---

## 🏛️ Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React/Expo)  │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PWA/Web       │    │   Python        │    │   Redis Cache   │
│   (Nginx)       │    │   (Garmin API)  │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Architecture

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| Frontend | `nutrition-tracker-frontend-web-1` | 4080 | React/TypeScript PWA |
| Backend | `nutrition-tracker-backend-1` | 4081 | Node.js API Server |
| Database | `nutrition-tracker-db-1` | 4082 | PostgreSQL Database |
| Redis | `nutrition-tracker-redis-1` | 6379 | Caching Layer |

---

## 📡 API Architecture

### Authentication Endpoints

```javascript
POST /api/auth/register     // User registration
POST /api/auth/login        // User login
GET  /api/auth/me          // Get current user
POST /api/auth/refresh-token // Refresh JWT token
POST /api/auth/logout       // Logout (client-side)
```

### Food Management Endpoints

```javascript
GET    /api/foods/search           // Search food database
GET    /api/foods/barcode/:barcode // Get food by barcode
GET    /api/foods/recent           // Get recently used foods
GET    /api/foods/custom           // Get custom foods
POST   /api/foods/custom           // Create custom food
PUT    /api/foods/custom/:id       // Update custom food
DELETE /api/foods/custom/:id       // Delete custom food
GET    /api/foods/recipes          // Get recipe-based foods
GET    /api/foods/exists           // Check if food exists
```

### Food Logging Endpoints

```javascript
GET    /api/logs                    // Get food logs
POST   /api/logs                    // Create food log
PUT    /api/logs/:id                // Update food log
DELETE /api/logs/:id                // Delete food log
GET    /api/logs/summary            // Get log summary
```

### Goal Management Endpoints

```javascript
GET    /api/goals                   // Get nutrition goals
POST   /api/goals                   // Create nutrition goals
PUT    /api/goals/:id               // Update nutrition goals
DELETE /api/goals/:id               // Delete nutrition goals
```

### Recipe Management Endpoints

```javascript
GET    /api/recipes                 // Get user recipes
POST   /api/recipes                 // Create recipe
PUT    /api/recipes/:id             // Update recipe
DELETE /api/recipes/:id             // Delete recipe
GET    /api/recipes/:id             // Get recipe details
```

### Weight Tracking Endpoints

```javascript
GET    /api/weight                  // Get weight entries
POST   /api/weight                  // Create weight entry
PUT    /api/weight/:id              // Update weight entry
DELETE /api/weight/:id              // Delete weight entry
GET    /api/weight/summary          // Get weight summary
```

### Fitness Integration Endpoints

```javascript
GET    /api/fitness/garmin/status           // Check Garmin connection
POST   /api/fitness/garmin/connect          // Connect Garmin account
POST   /api/fitness/garmin/disconnect       // Disconnect Garmin account
GET    /api/fitness/garmin/daily/:date      // Get daily summary
GET    /api/fitness/garmin/activities       // Get activities
POST   /api/fitness/garmin/sync             // Trigger manual sync
```

---

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  age INTEGER,
  gender VARCHAR(10),
  birthdate DATE,
  activity_level VARCHAR(20),
  weight_goal VARCHAR(20),
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Food Items Table
```sql
CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  barcode VARCHAR(100),
  calories_per_serving INTEGER NOT NULL,
  protein_grams DECIMAL(10, 2),
  carbs_grams DECIMAL(10, 2),
  fat_grams DECIMAL(10, 2),
  serving_size VARCHAR(50),
  serving_unit VARCHAR(50),
  source VARCHAR(50),
  source_id VARCHAR(100),
  user_id INTEGER REFERENCES users(id),
  recipe_id INTEGER REFERENCES recipes(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Food Logs Table
```sql
CREATE TABLE food_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  food_item_id INTEGER NOT NULL,
  log_date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  servings DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Recipes Table
```sql
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 1,
  total_calories DECIMAL(10, 2),
  total_protein_grams DECIMAL(10, 2),
  total_carbs_grams DECIMAL(10, 2),
  total_fat_grams DECIMAL(10, 2),
  sync_id VARCHAR(36) NOT NULL DEFAULT gen_random_uuid(),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Weight Tracking Table
```sql
CREATE TABLE weight_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  weight_value DECIMAL(5,2) NOT NULL,
  entry_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Garmin Integration Tables
```sql
CREATE TABLE garmin_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE garmin_daily_summaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  total_steps INTEGER,
  total_distance_meters INTEGER,
  total_calories INTEGER,
  active_calories INTEGER,
  bmr_calories INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  resting_heart_rate INTEGER,
  avg_stress_level INTEGER,
  floor_climbed INTEGER,
  minutes_sedentary INTEGER,
  minutes_lightly_active INTEGER,
  minutes_moderately_active INTEGER,
  minutes_highly_active INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 External Integrations

### 1. OpenFoodFacts API Integration

**Purpose**: Provides comprehensive food database with nutritional information

**Implementation**:
- Direct API calls to `https://world.openfoodfacts.org/api/v0`
- Barcode lookup functionality
- Food search with relevance scoring
- Nutritional data mapping and normalization
- Caching for performance optimization

**Key Features**:
- Barcode scanning and lookup
- Food search with fuzzy matching
- Nutritional data extraction
- Brand information retrieval
- Serving size calculations

### 2. Garmin Connect Integration

**Purpose**: Syncs fitness data from Garmin devices for activity-based calorie adjustments

**Implementation**:
- Python-based integration using `python-garminconnect` library
- Per-user credential storage
- Rate limiting and caching
- Background sync capabilities
- Daily summary data retrieval

**Key Features**:
- User-specific credential management
- Daily activity summaries
- Step counting and distance tracking
- Heart rate monitoring
- Activity level classification
- Calorie burn calculations

**Data Types**:
- Daily summaries (steps, calories, heart rate)
- Activity data (sedentary, light, moderate, high activity)
- User profile information
- Device synchronization status

### 3. Barcode Scanning Integration

**Purpose**: Enables quick food addition via product barcode scanning

**Implementation**:
- Multiple scanner implementations (ZXing, Quagga, simplified)
- Camera access with permissions
- Real-time barcode detection
- Fallback mechanisms for different devices
- Integration with OpenFoodFacts API

**Key Features**:
- Real-time camera scanning
- Multiple barcode format support
- Offline capability with cached data
- User-friendly interface
- Error handling and retry logic

---

## 🔐 Authentication & Security

### JWT-Based Authentication

**Token Structure**:
```javascript
{
  id: user.id,
  email: user.email,
  iat: issued_at_timestamp,
  exp: expiration_timestamp
}
```

**Security Features**:
- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration (configurable)
- Refresh token mechanism
- Rate limiting on authentication endpoints
- CORS protection
- Input validation with express-validator

**Authentication Flow**:
1. User registers/logs in with email/password
2. Server validates credentials and generates JWT
3. Client stores token in localStorage
4. Token included in Authorization header for API calls
5. Server validates token on protected routes
6. Automatic token refresh when needed

---

## 📱 Frontend Architecture

### Screen Structure

```
App.tsx
├── AuthProvider
├── SyncProvider
└── NavigationContainer
    └── AppNavigator
        ├── AuthStack (Login/Register)
        └── MainStack
            ├── HomeScreen
            ├── FoodScreen
            ├── FoodSearchScreen
            ├── BarcodeScanner
            ├── RecipeScreen
            ├── WeightScreen
            ├── BloodPressureScreen
            ├── FitnessScreen
            ├── GarminSettingsScreen
            └── SettingsScreen
```

### Key Components

#### Food Management
- `FoodScreen.tsx` - Main food logging interface
- `FoodSearchScreen.tsx` - Food search and selection
- `BarcodeScanner.tsx` - Camera-based barcode scanning
- `AddFoodScreen.tsx` - Custom food creation

#### Recipe Management
- `RecipeScreen.tsx` - Recipe list and management
- `RecipeDetailScreen.tsx` - Individual recipe view
- `AddIngredientScreen.tsx` - Recipe ingredient addition

#### Health Tracking
- `WeightScreen.tsx` - Weight tracking interface
- `BloodPressureScreen.tsx` - Blood pressure logging
- `FitnessScreen.tsx` - Fitness data display

#### Settings & Configuration
- `GarminSettingsScreen.tsx` - Garmin integration setup
- `SettingsScreen.tsx` - General app settings
- `EditProfileScreen.tsx` - User profile management

### State Management

**Context Providers**:
- `AuthContext` - User authentication state
- `SyncContext` - Data synchronization state

**Service Layer**:
- `foodService.ts` - Food-related API calls
- `fitnessService.ts` - Garmin integration
- `weightService.ts` - Weight tracking
- `recipeService.ts` - Recipe management
- `authService.ts` - Authentication

---

## 🚀 Deployment Architecture

### Development Environment

**Local Development**:
- Frontend: macOS (port 19006)
- Backend: macOS (port 4081)
- Database: Remote server (192.168.1.17:4082)
- Redis: Local development

**Environment Configuration**:
```bash
NODE_ENV=development
REACT_APP_API_URL=http://localhost:4081
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Production Environment

**Server Deployment**:
- All services in Docker containers
- Frontend: 192.168.1.17:4080
- Backend: 192.168.1.17:4081
- Database: 192.168.1.17:4082
- Redis: Docker container

**Docker Compose Configuration**:
```yaml
services:
  frontend-web:
    build: ./frontend
    ports: ["4080:80"]
    environment:
      - REACT_APP_API_URL=http://backend:3000

  backend:
    build: ./backend
    ports: ["4081:3000"]
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/dbname
      - JWT_SECRET=your_secret_key

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

### Deployment Process

**Frontend Updates**:
```bash
# Use update_frontend.sh script
./update_frontend.sh
```

**Backend Updates**:
```bash
# Complete rebuild required
scp backend/src/path/to/file.js server:/mnt/Media/Docker/nutrition-tracker/backend/src/path/to/
ssh server "cd /mnt/Media/Docker/nutrition-tracker && docker compose stop backend && docker compose rm -f backend && docker compose up -d --build backend"
```

---

## 🔄 Data Synchronization

### Sync Architecture

**Sync Metadata**:
- Tracks last sync time per user
- Handles conflict resolution
- Manages sync status (synced, pending, failed)
- Supports offline-first operations

**Sync Strategies**:
- Real-time sync for critical data
- Background sync for fitness data
- Manual sync triggers
- Conflict resolution with server wins

### Garmin Data Sync

**Sync Process**:
1. User connects Garmin account
2. Credentials stored securely in database
3. Background job syncs data periodically
4. New data fetched based on last sync time
5. Data cached to minimize API calls
6. Rate limiting prevents API abuse

**Sync Features**:
- Per-user credential management
- Rate limiting and caching
- Background sync with configurable intervals
- Manual sync triggers
- Error handling and retry logic

---

## 📊 Performance Optimizations

### Caching Strategy

**Redis Caching**:
- Food search results (1 hour TTL)
- Barcode lookups (1 hour TTL)
- User preferences
- Session data

**Frontend Caching**:
- Recent foods in AsyncStorage
- User preferences
- Authentication tokens
- Offline data storage

### Database Optimizations

**Indexes**:
- User email and ID indexes
- Food item barcode and name indexes
- Log date and meal type indexes
- Recipe user and sync ID indexes

**Query Optimization**:
- Connection pooling
- Prepared statements
- Efficient joins
- Pagination for large datasets

---

## 🔧 Development Workflow

### Code Organization

**Backend Structure**:
```
backend/src/
├── controllers/     # Request handlers
├── models/         # Data models
├── routes/         # API route definitions
├── services/       # Business logic
├── middleware/     # Custom middleware
├── config/         # Configuration files
├── utils/          # Utility functions
└── python/         # Python integrations
```

**Frontend Structure**:
```
frontend/src/
├── screens/        # Screen components
├── components/     # Reusable components
├── services/       # API service layer
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── types/          # TypeScript definitions
└── assets/         # Static assets
```

### Development Commands

**Local Development**:
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npx expo start --web

# Kill existing processes
lsof -ti:4081,19000,19001 | xargs kill -9
```

**Production Deployment**:
```bash
# Full deployment
docker compose up -d

# View logs
docker compose logs -f [service_name]
```

---

## 🐛 Troubleshooting & Debugging

### Common Issues

1. **404 Not Found**: Requires service rebuild for new routes
2. **Database Connection**: Check credentials and container health
3. **Frontend Not Updating**: Rebuild frontend container
4. **Camera Access**: Check permissions and meta tags
5. **Garmin Integration**: Verify credentials and rate limits

### Debug Endpoints

```javascript
GET /health                    // API health check
GET /api/foods/debug-search    // Food search debugging
GET /api/fitness/garmin/status // Garmin connection status
```

### Logging

**Backend Logging**:
- HTTP request logging with Morgan
- Custom logger for application events
- Error logging with stack traces
- Performance monitoring

**Frontend Logging**:
- Console logging for development
- Error boundary for React errors
- API call logging
- User interaction tracking

---

## 📈 Future Enhancements

### Planned Features

1. **Activity-Based Calorie Adjustment**: Automatic calorie goal adjustment based on Garmin activity data
2. **Offline Support**: Full offline functionality with sync when online
3. **Mobile Apps**: Native iOS and Android applications
4. **Advanced Analytics**: Detailed nutrition and fitness analytics
5. **Social Features**: Sharing and community features
6. **AI Integration**: Smart food recommendations and meal planning

### Technical Improvements

1. **Microservices Architecture**: Split into smaller, focused services
2. **GraphQL API**: More efficient data fetching
3. **Real-time Updates**: WebSocket integration for live data
4. **Advanced Caching**: Multi-level caching strategy
5. **Performance Monitoring**: APM integration
6. **Automated Testing**: Comprehensive test suite

---

## 🔗 Integration with FitnessGeek

### Migration Path

The Nutrition Tracker serves as the foundation for FitnessGeek, providing:

1. **Proven Architecture**: Tested and deployed architecture
2. **Feature Set**: Comprehensive nutrition and fitness tracking
3. **Database Schema**: Well-designed data models
4. **API Structure**: RESTful API design patterns
5. **Integration Patterns**: External service integration examples

### Key Learnings

1. **User Management**: Current JWT-based auth can be replaced with baseGeek integration
2. **Food Database**: OpenFoodFacts integration provides comprehensive food data
3. **Fitness Integration**: Garmin Connect integration pattern for fitness data
4. **Mobile-First Design**: PWA approach with responsive design
5. **Data Synchronization**: Robust sync patterns for cross-device usage

---

This comprehensive analysis provides the foundation for understanding the Nutrition Tracker's architecture and serves as a reference for the FitnessGeek development process.