# AI Integration Plans for FitnessGeek

## Overview
FitnessGeek integrates with `baseGeek`'s centralized AI service (`aiGeek`) for all AI-powered features. This approach provides a unified AI experience across all GeekSuite applications while keeping business logic and optimization within FitnessGeek.

## Current Status

### ✅ **IMPLEMENTED** - Natural Language Food Logging
- **Feature**: Parse natural language food descriptions into structured data
- **Example**: "2 chicken tacos and a dos equis" → structured food items with nutrition
- **Technical Implementation**: Uses `baseGeek`'s AI service via `/api/ai/parse-json` endpoint
- **API Endpoint**: `POST /api/ai/parse-food`
- **Frontend**: Available in "Auto" tab of AddFoodDialog

### 🔄 **PLANNED** - Additional AI Features
- Meal Suggestions
- Nutrition Analysis
- Goal Recommendations

## Architecture

### Backend Integration
- **Service**: `baseGeekAIService.js` - Handles communication with `baseGeek`'s AI
- **Routes**: `aiRoutes.js` - Exposes AI endpoints to frontend
- **Authentication**: Uses `JWT_SECRET` for secure communication with `baseGeek`
- **Settings**: AI features controlled via user settings in database

### Frontend Integration
- **Service**: `aiService.js` - Frontend API calls to AI endpoints
- **Component**: `NaturalLanguageInput.jsx` - UI for natural language food input
- **Settings**: AI features can be enabled/disabled per user

## User Settings Integration

### AI Settings Structure
```javascript
{
  ai: {
    enabled: true,  // Master toggle for all AI features
    features: {
      natural_language_food_logging: true,
      meal_suggestions: true,
      nutrition_analysis: true,
      goal_recommendations: true
    }
  }
}
```

### Settings API Endpoints
- `GET /api/settings` - Get all user settings including AI
- `PUT /api/settings/ai` - Update AI settings specifically
- `PUT /api/settings` - Update all settings (includes AI)

### Frontend Settings Service
- `settingsService.updateAISettings()` - Update AI settings
- `settingsService.getDefaultAISettings()` - Get default AI configuration

## Technical Implementation

### Backend AI Service
```javascript
// Check if AI is enabled for specific user and feature
const isEnabled = await baseGeekAIService.isEnabledForUser(userId, 'natural_language_food_logging');

// Parse food with user settings check
const result = await baseGeekAIService.parseFoodDescription(description, userContext, userId);
```

### Frontend AI Service
```javascript
// Check if AI is enabled for current user
const isEnabled = await aiService.isEnabledForUser();

// Parse food description
const result = await aiService.parseFoodDescription('2 chicken tacos and a dos equis');
```

## API Endpoints

### Food Parsing
```http
POST /api/ai/parse-food
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "description": "2 chicken tacos and a dos equis",
  "userContext": {
    "dietary_preferences": "none"
  }
}
```

### AI Status
```http
GET /api/ai/status
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "enabled": true,
    "baseGeekUrl": "https://basegeek.clintgeek.com",
    "jwtSecretConfigured": true,
    "enabledForUser": true
  }
}
```

## Environment Variables

### Required
```bash
# baseGeek Integration
BASEGEEK_URL=https://basegeek.clintgeek.com
JWT_SECRET=your_jwt_secret_here
```

### Removed (Now in Database Settings)
- ~~AI_FEATURES_ENABLED~~ - Now controlled via user settings
- ~~AI_DAILY_LIMIT~~ - Handled by baseGeek service

## Implementation Phases

### ✅ Phase 1: Backend Integration
- [x] Create `baseGeekAIService.js`
- [x] Implement food parsing endpoint
- [x] Add AI routes to server
- [x] Integrate with user settings

### ✅ Phase 2: Frontend Integration
- [x] Create `aiService.js` for frontend API calls
- [x] Build `NaturalLanguageInput.jsx` component
- [x] Integrate with `AddFoodDialog.jsx` tabs
- [x] Add settings-based AI control

### 🔄 Phase 3: Settings UI (Future)
- [ ] Create AI settings page in frontend
- [ ] Add toggle controls for individual AI features
- [ ] Show AI usage statistics

## API Costs and Management

### Cost Management
- **Centralized**: All AI costs managed by `baseGeek`
- **User Control**: Users can disable AI features to reduce usage
- **Feature Granularity**: Individual features can be toggled on/off

### Security
- **Authentication**: JWT-based authentication with `baseGeek`
- **User Isolation**: Each user's AI settings are isolated
- **Feature Control**: Granular control over which AI features are enabled

## Testing

### Backend Testing
```bash
# Test AI settings integration
node test-ai-settings.js

# Test AI food parsing
node test-ai-integration.js
```

### Frontend Testing
- Test AI parsing with various food descriptions
- Test AI disabled state and error handling
- Test settings integration

## Deployment Notes

### Database Migration
- AI settings are automatically created for new users
- Existing users will get default AI settings (enabled)
- No manual migration required

### Configuration
- Ensure `JWT_SECRET` matches `baseGeek` configuration
- Verify `BASEGEEK_URL` is accessible from FitnessGeek
- Test AI endpoints after deployment

## Future Enhancements

### Planned Features
1. **Meal Suggestions**: AI-powered meal recommendations
2. **Nutrition Analysis**: Detailed nutrition insights
3. **Goal Recommendations**: AI-driven fitness goal suggestions

### UI Improvements
1. **Settings Page**: Dedicated AI settings interface
2. **Usage Analytics**: Show AI feature usage statistics
3. **Smart Defaults**: Learn user preferences over time

## Troubleshooting

### Common Issues
1. **AI Disabled Error**: Check user settings, not environment variables
2. **JWT Authentication**: Verify `JWT_SECRET` matches `baseGeek`
3. **Network Issues**: Ensure `BASEGEEK_URL` is accessible
4. **Settings Not Saving**: Check database connection and user authentication

### Debug Commands
```bash
# Check AI service status
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/ai/status

# Test food parsing
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"description":"2 chicken tacos"}' \
  http://localhost:3001/api/ai/parse-food
```
