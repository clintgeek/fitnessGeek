# FitnessGeek Development Plan

> **Version**: 1.0
> **Last Updated**: 2025-04-19
> **Project**: FitnessGeek (Nutrition Tracker Rewrite)
> **Status**: Planning Phase
> **Target**: GeekSuite Architecture with MUI/Vite + baseGeek Integration

---

## 🎯 Project Vision

Transform the existing nutrition-tracker into **FitnessGeek**, a modern, integrated fitness and nutrition tracking application that follows the GeekSuite design system and architecture. The new application will maintain all existing functionality while providing a superior user experience, better performance, and seamless integration with the broader GeekSuite ecosystem.

### Core Objectives

1. **Modernize Technology Stack**: Migrate from React Native/Expo to React + Vite + MUI
2. **Integrate with GeekSuite**: Use baseGeek for user management and database
3. **Improve User Experience**: Apply GeekSuite design system and UX patterns
4. **Enhance Performance**: Leverage modern web technologies and optimization
5. **Maintain Functionality**: Preserve all existing nutrition and fitness tracking features
6. **Future-Proof Architecture**: Build for scalability and extensibility

---

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5+
- **State Management**: Zustand (following baseGeek pattern)
- **Routing**: React Router v6
- **Styling**: MUI Theme + SASS (limited use)
- **PWA**: Vite PWA plugin
- **Animation**: Framer Motion

#### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB (via baseGeek)
- **Authentication**: baseGeek JWT system
- **Caching**: Redis
- **Validation**: Zod
- **Logging**: Winston

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB (shared with baseGeek)
- **Caching**: Redis
- **Deployment**: Remote server (192.168.1.17)
- **CI/CD**: GitHub Actions (future)

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FitnessGeek   │    │    baseGeek     │    │   MongoDB       │
│   Frontend      │◄──►│   (Auth/Users)  │◄──►│   (Shared DB)   │
│   (React/Vite)  │    │   (API Gateway) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FitnessGeek   │    │   Python        │    │   Redis Cache   │
│   Backend       │    │   (Garmin API)  │    │                 │
│   (Node.js)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📋 Development Phases

### Phase 1: Foundation & Setup (Week 1-2)

#### 1.1 Project Initialization
- [ ] Create FitnessGeek repository structure
- [ ] Set up Vite + React + TypeScript project
- [ ] Configure MUI theme following GeekSuite design system
- [ ] Set up ESLint, Prettier, and TypeScript configuration
- [ ] Configure Docker development environment

#### 1.2 baseGeek Integration
- [ ] Integrate baseGeek authentication system
- [ ] Set up shared auth store (Zustand)
- [ ] Configure API client with baseGeek endpoints
- [ ] Implement user context and providers
- [ ] Set up protected route system

#### 1.3 Database Schema Design
- [ ] Design MongoDB schemas for all collections
- [ ] Create Mongoose models
- [ ] Set up database connection (shared with baseGeek)
- [ ] Implement data validation with Zod
- [ ] Create database migration scripts

#### 1.4 Core Infrastructure
- [ ] Set up Express server with TypeScript
- [ ] Configure middleware (CORS, logging, validation)
- [ ] Set up Redis caching layer
- [ ] Implement error handling and logging
- [ ] Create health check endpoints

### Phase 2: Core Features Development (Week 3-6)

#### 2.1 User Interface Foundation
- [ ] Implement GeekSuite design system components
- [ ] Create responsive layout system
- [ ] Build navigation structure
- [ ] Implement theme switching (light/dark mode)
- [ ] Create loading states and error boundaries

#### 2.2 Food Management System
- [ ] **Food Database Integration**
  - [ ] OpenFoodFacts API integration
  - [ ] Food search with fuzzy matching
  - [ ] Barcode scanning interface
  - [ ] Food item creation and management
  - [ ] Nutritional data validation

- [ ] **Food Logging System**
  - [ ] Daily food logging interface
  - [ ] Meal categorization (breakfast, lunch, dinner, snacks)
  - [ ] Serving size management
  - [ ] Quick add functionality
  - [ ] Recent foods feature

#### 2.3 Recipe Management
- [ ] **Recipe Creation**
  - [ ] Recipe builder interface
  - [ ] Ingredient management
  - [ ] Nutritional calculation
  - [ ] Recipe categorization

- [ ] **Recipe Usage**
  - [ ] Recipe to food item conversion
  - [ ] Recipe scaling
  - [ ] Recipe search and filtering
  - [ ] Recipe sharing (future)

#### 2.4 Nutrition Goals & Tracking
- [ ] **Goal Management**
  - [ ] Calorie goal setting
  - [ ] Macronutrient targets
  - [ ] Goal progress tracking
  - [ ] Goal recommendations

- [ ] **Progress Analytics**
  - [ ] Daily nutrition summaries
  - [ ] Weekly/monthly reports
  - [ ] Progress charts and graphs
  - [ ] Trend analysis

### Phase 3: Advanced Features (Week 7-10)

#### 3.1 Fitness Integration
- [ ] **Garmin Connect Integration**
  - [ ] Python service integration
  - [ ] User credential management
  - [ ] Daily activity sync
  - [ ] Activity-based calorie adjustments

- [ ] **Fitness Data Display**
  - [ ] Daily activity summaries
  - [ ] Step counting and distance
  - [ ] Heart rate monitoring
  - [ ] Activity level classification

#### 3.2 Health Tracking
- [ ] **Weight Management**
  - [ ] Weight entry interface
  - [ ] Weight trend analysis
  - [ ] Goal weight tracking
  - [ ] BMI calculations

- [ ] **Health Metrics**
  - [ ] Blood pressure logging
  - [ ] Body measurements
  - [ ] Health goal tracking
  - [ ] Health insights

#### 3.3 Data Synchronization
- [ ] **Sync System**
  - [ ] Real-time data sync
  - [ ] Offline capability
  - [ ] Conflict resolution
  - [ ] Sync status indicators

- [ ] **Data Export/Import**
  - [ ] Data backup functionality
  - [ ] Export to common formats
  - [ ] Import from other apps
  - [ ] Data migration tools

### Phase 4: Enhancement & Polish (Week 11-12)

#### 4.1 Performance Optimization
- [ ] **Frontend Optimization**
  - [ ] Code splitting and lazy loading
  - [ ] Image optimization
  - [ ] Bundle size optimization
  - [ ] PWA performance

- [ ] **Backend Optimization**
  - [ ] Database query optimization
  - [ ] Caching strategies
  - [ ] API response optimization
  - [ ] Rate limiting

#### 4.2 User Experience
- [ ] **Accessibility**
  - [ ] WCAG compliance
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast optimization

- [ ] **Mobile Experience**
  - [ ] Responsive design optimization
  - [ ] Touch-friendly interfaces
  - [ ] Mobile-specific features
  - [ ] PWA installation

#### 4.3 Advanced Features
- [ ] **Smart Recommendations**
  - [ ] Food recommendations
  - [ ] Meal planning suggestions
  - [ ] Goal-based insights
  - [ ] Personalized tips

- [ ] **Social Features** (Future)
  - [ ] Friend connections
  - [ ] Progress sharing
  - [ ] Community challenges
  - [ ] Social feed

---

## 🗄️ Database Schema Design

### MongoDB Collections

#### Users Collection (baseGeek managed)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  profile: {
    weight: Number,
    height: Number,
    age: Number,
    gender: String,
    birthdate: Date,
    activity_level: String,
    weight_goal: String,
    profile_picture: String,
    fitness_preferences: Object
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Food Items Collection
```javascript
{
  _id: ObjectId,
  name: String,                    // "Apple", "Chicken Breast"
  brand: String,                   // "Mott's", "Tyson"
  barcode: String,                 // UPC/EAN code
  nutrition: {
    calories_per_serving: Number,  // 95, 165
    protein_grams: Number,         // 0, 31
    carbs_grams: Number,           // 25, 0
    fat_grams: Number,             // 0, 3.6
    fiber_grams: Number,           // 4, 0
    sugar_grams: Number,           // 19, 0
    sodium_mg: Number              // 2, 74
  },
  serving: {
    size: Number,                  // 100, 100
    unit: String                   // "g", "g"
  },
  source: String,                  // "nutritionix", "usda", "openfoodfacts", "custom"
  source_id: String,               // API ID or custom ID
  user_id: ObjectId,               // For custom foods (null for global foods)
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### Food Logs Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  log_date: Date,                  // 2025-01-20
  meal_type: String,               // "breakfast", "lunch", "dinner", "snack"
  food_item_id: ObjectId,          // Reference to food_items
  servings: Number,                // 1.5, 2.0
  notes: String,                   // Optional user notes
  created_at: Date,
  updated_at: Date
}
```

#### Daily Summaries Collection (computed/aggregated)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  date: Date,                      // 2025-01-20
  totals: {
    calories: Number,              // 1850
    protein_grams: Number,         // 120
    carbs_grams: Number,           // 200
    fat_grams: Number,             // 65
    fiber_grams: Number,           // 25
    sugar_grams: Number,           // 85
    sodium_mg: Number              // 2300
  },
  meals: {
    breakfast: {
      calories: Number,
      protein_grams: Number,
      carbs_grams: Number,
      fat_grams: Number
    },
    lunch: { ... },
    dinner: { ... },
    snack: { ... }
  },
  goals_met: {
    calories: Boolean,
    protein: Boolean,
    carbs: Boolean,
    fat: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

#### Recipes Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String,
  description: String,
  servings: Number,
  prep_time: Number,
  cook_time: Number,
  difficulty: String,
  cuisine: String,
  ingredients: [{
    food_item_id: ObjectId,
    amount: Number,
    unit: String,
    order_index: Number,
    notes: String
  }],
  instructions: [{
    step: Number,
    instruction: String
  }],
  nutrition: {
    total_calories: Number,
    total_protein: Number,
    total_carbs: Number,
    total_fat: Number,
    per_serving: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    }
  },
  tags: [String],
  is_deleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Weight Entries Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  weight_value: Number,
  entry_date: Date,
  notes: String,
  body_fat_percentage: Number,
  muscle_mass: Number,
  water_percentage: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Garmin Data Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  date: Date,
  daily_summary: {
    total_steps: Number,
    total_distance_meters: Number,
    total_calories: Number,
    active_calories: Number,
    bmr_calories: Number,
    avg_heart_rate: Number,
    max_heart_rate: Number,
    resting_heart_rate: Number,
    avg_stress_level: Number,
    floor_climbed: Number,
    minutes_sedentary: Number,
    minutes_lightly_active: Number,
    minutes_moderately_active: Number,
    minutes_highly_active: Number,
    sleep_duration: Number,
    sleep_quality: Number
  },
  activities: [{
    activity_type: String,
    duration: Number,
    calories: Number,
    distance: Number,
    start_time: Date,
    end_time: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Nutrition Goals Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  calories: Number,
  protein_grams: Number,
  carbs_grams: Number,
  fat_grams: Number,
  fiber_grams: Number,
  sugar_grams: Number,
  sodium_mg: Number,
  start_date: Date,
  end_date: Date,
  is_active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 UI/UX Design System

### GeekSuite Design Integration

#### Color Palette
- **Primary**: `#4A90E2` (Geek Blue)
- **Secondary**: `#7B61FF` (Accent Purple)
- **Background**: `#f5f5f5` (Light Gray)
- **Surface**: `#ffffff` (White)
- **Text Primary**: `#212121` (Dark Gray)
- **Text Secondary**: `#757575` (Medium Gray)

#### Typography
- **Font Family**: Roboto
- **H1**: 2.5rem, 700 weight
- **H2**: 2rem, 600 weight
- **H3**: 1.5rem, 500 weight
- **Body**: 1rem, 400 weight
- **Caption**: 0.875rem, 400 weight

#### Component Library
- **Cards**: Rounded corners (16px), shadows, consistent spacing
- **Buttons**: Primary/Secondary variants, rounded corners, hover effects
- **Inputs**: Outlined variants, validation states, helper text
- **Navigation**: Bottom navigation for mobile, sidebar for desktop
- **Modals**: Centered with backdrop blur, smooth animations

### Screen Layouts

#### Main Dashboard
```
┌─────────────────────────────────────┐
│ Header (Logo, User Menu, Settings)  │
├─────────────────────────────────────┤
│ Today's Summary Card                │
│ [Calories] [Protein] [Carbs] [Fat]  │
├─────────────────────────────────────┤
│ Quick Actions                       │
│ [Add Food] [Log Weight] [View Goals]│
├─────────────────────────────────────┤
│ Recent Foods                        │
│ [Food Item] [Food Item] [Food Item] │
├─────────────────────────────────────┤
│ Today's Meals                       │
│ Breakfast | Lunch | Dinner | Snacks │
└─────────────────────────────────────┘
```

#### Food Search
```
┌─────────────────────────────────────┐
│ Search Bar with Barcode Scanner     │
├─────────────────────────────────────┤
│ Filters: [All] [Recent] [Custom]    │
├─────────────────────────────────────┤
│ Search Results                      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │Food Item│ │Food Item│ │Food Item│ │
│ │Calories │ │Calories │ │Calories │ │
│ └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

---

## 🔌 API Architecture

### Endpoint Structure

#### Authentication (baseGeek)
```javascript
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/auth/refresh-token
POST /api/auth/logout
```

#### Food Management
```javascript
GET    /api/foods/search
GET    /api/foods/barcode/:barcode
GET    /api/foods/recent
GET    /api/foods/custom
POST   /api/foods/custom
PUT    /api/foods/custom/:id
DELETE /api/foods/custom/:id
GET    /api/foods/recipes
```

#### Food Logging
```javascript
GET    /api/logs/:date
POST   /api/logs
PUT    /api/logs/:id
DELETE /api/logs/:id
GET    /api/logs/summary/:startDate/:endDate
```

#### Recipes
```javascript
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id
POST   /api/recipes/:id/ingredients
```

#### Weight Tracking
```javascript
GET    /api/weight
POST   /api/weight
PUT    /api/weight/:id
DELETE /api/weight/:id
GET    /api/weight/summary/:startDate/:endDate
```

#### Fitness Integration
```javascript
GET    /api/fitness/garmin/status
POST   /api/fitness/garmin/connect
GET    /api/fitness/garmin/daily/:date
GET    /api/fitness/garmin/activities
POST   /api/fitness/garmin/sync
```

#### Goals
```javascript
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
```

---

## 🚀 Deployment Strategy

### Development Environment
```yaml
# docker-compose.dev.yml
services:
  fitnessgeek-frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app", "/app/node_modules"]
    environment:
      - VITE_API_URL=http://localhost:3001
      - VITE_BASEGEEK_URL=http://localhost:8987

  fitnessgeek-backend:
    build: ./backend
    ports: ["3001:3001"]
    volumes: ["./backend:/app", "/app/node_modules"]
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://localhost:27017/fitnessgeek
      - REDIS_URL=redis://localhost:6379

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

### Production Environment
```yaml
# docker-compose.prod.yml
services:
  fitnessgeek-frontend:
    build: ./frontend
    ports: ["4080:80"]
    environment:
      - VITE_API_URL=http://backend:3001
      - VITE_BASEGEEK_URL=https://basegeek.clintgeek.com

  fitnessgeek-backend:
    build: ./backend
    ports: ["4081:3001"]
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://datageek_admin:pass@192.168.1.17:27018/fitnessgeek
      - REDIS_URL=redis://redis:6379

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

---

## 📊 Migration Strategy

### Data Migration from Nutrition Tracker

#### Phase 1: Schema Mapping
1. **Map PostgreSQL tables** to MongoDB collections
2. **Create migration scripts** for data transformation
3. **Validate data integrity** during migration
4. **Test migration** with sample data

#### Phase 2: User Data Migration
1. **Migrate user profiles** to baseGeek
2. **Update user references** in all collections
3. **Preserve user preferences** and settings
4. **Maintain data relationships**

#### Phase 3: Content Migration
1. **Migrate food items** with nutritional data
2. **Transfer food logs** with meal categorization
3. **Migrate recipes** with ingredients
4. **Transfer weight entries** and health data

#### Phase 4: Validation & Testing
1. **Verify data completeness**
2. **Test all functionality** with migrated data
3. **Performance testing** with production data
4. **User acceptance testing**

---

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook for component documentation
- **Integration Tests**: User workflow testing
- **E2E Tests**: Playwright for critical user journeys

### Backend Testing
- **Unit Tests**: Jest for service and utility functions
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB integration testing
- **Performance Tests**: Load testing for critical endpoints

### Quality Assurance
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Security**: Dependency scanning, input validation
- **Performance**: Bundle analysis, API response times
- **Accessibility**: WCAG compliance testing

---

## 📈 Success Metrics

### Technical Metrics
- **Performance**: < 2s page load time, < 500ms API response
- **Reliability**: 99.9% uptime, < 1% error rate
- **Security**: Zero critical vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliance

### User Experience Metrics
- **Adoption**: User registration and retention rates
- **Engagement**: Daily active users, feature usage
- **Satisfaction**: User feedback and ratings
- **Efficiency**: Task completion rates and time

### Business Metrics
- **Data Accuracy**: Nutrition calculation accuracy
- **Integration Success**: Garmin sync reliability
- **Cross-Platform**: Consistent experience across devices
- **Scalability**: System performance under load

---

## 🎯 Next Steps

### Immediate Actions (Week 1)
1. **Set up project repository** and development environment
2. **Configure baseGeek integration** for authentication
3. **Design MongoDB schemas** and create models
4. **Set up Vite + React + MUI** project structure

### Short-term Goals (Week 2-4)
1. **Implement core UI components** following GeekSuite design
2. **Build food management system** with OpenFoodFacts integration
3. **Create food logging interface** with meal categorization
4. **Develop recipe management** system

### Medium-term Goals (Week 5-8)
1. **Integrate Garmin Connect** for fitness data
2. **Implement weight tracking** and health metrics
3. **Build analytics and reporting** features
4. **Add data synchronization** capabilities

### Long-term Goals (Week 9-12)
1. **Performance optimization** and testing
2. **User experience refinement** and accessibility
3. **Advanced features** and smart recommendations
4. **Production deployment** and monitoring

---

This comprehensive plan provides a roadmap for transforming nutrition-tracker into FitnessGeek while maintaining all existing functionality and improving the user experience through modern web technologies and GeekSuite integration.