# baseGeek User Management Integration Guide

> **Version**: 1.0
> **Last Updated**: 2025-04-19
> **Applies to**: All GeekSuite applications (FitnessGeek, NoteGeek, BuJoGeek, etc.)

---

## 🏗️ Architecture Overview

baseGeek serves as the central authentication and user management hub for the entire GeekSuite ecosystem. It provides a unified authentication system that allows users to seamlessly access multiple applications with a single login.

### Core Components

1. **API Server** (`packages/api/`) - RESTful authentication endpoints
2. **UI Package** (`packages/ui/`) - Shared authentication components and state management
3. **MongoDB Database** - Centralized user data storage
4. **JWT Token System** - Secure, app-specific authentication tokens

---

## 🔐 Authentication Flow

### 1. User Login Process

```mermaid
sequenceDiagram
    participant App as GeekSuite App
    participant baseGeek as baseGeek API
    participant DB as MongoDB

    App->>baseGeek: POST /api/auth/login
    Note over App,baseGeek: {identifier, password, app}
    baseGeek->>DB: Find user by email/username
    DB-->>baseGeek: User data + passwordHash
    baseGeek->>baseGeek: Verify password with bcrypt
    baseGeek->>baseGeek: Generate JWT tokens
    baseGeek-->>App: {token, refreshToken, user}
    App->>App: Store tokens in shared auth store
```

### 2. Token Validation

```mermaid
sequenceDiagram
    participant App as GeekSuite App
    participant baseGeek as baseGeek API

    App->>baseGeek: POST /api/auth/validate
    Note over App,baseGeek: {token, app}
    baseGeek->>baseGeek: Verify JWT signature
    baseGeek->>baseGeek: Check app claim
    baseGeek-->>App: {valid: true/false, user}
```

---

## 🛠️ Integration Methods

### Method 1: Direct API Integration (Recommended)

Use the baseGeek API endpoints directly from your application:

```javascript
// Authentication endpoints
const AUTH_ENDPOINTS = {
  login: 'https://basegeek.clintgeek.com/api/auth/login',
  validate: 'https://basegeek.clintgeek.com/api/auth/validate',
  refresh: 'https://basegeek.clintgeek.com/api/auth/refresh',
  register: 'https://basegeek.clintgeek.com/api/auth/register',
  profile: 'https://basegeek.clintgeek.com/api/auth/profile'
};

// User management endpoints
const USER_ENDPOINTS = {
  me: 'https://basegeek.clintgeek.com/api/users/me',
  profile: 'https://basegeek.clintgeek.com/api/users/profile',
  all: 'https://basegeek.clintgeek.com/api/users'
};
```

### Method 2: Shared Auth Store Integration

Import and use the shared authentication store from baseGeek:

```javascript
import useSharedAuthStore from '@basegeek/shared-auth-store';

// In your React component
const { login, logout, isAuthenticated, user } = useSharedAuthStore();
```

### Method 3: Cross-Origin Authentication

For applications running on different domains, use the CORS-enabled endpoints with proper credentials handling.

---

## 📡 API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/login` | POST | User login | `{identifier, password, app}` | `{token, refreshToken, user}` |
| `/api/auth/validate` | POST | Validate token | `{token, app}` | `{valid, user}` |
| `/api/auth/refresh` | POST | Refresh token | `{refreshToken, app}` | `{token, refreshToken, user}` |
| `/api/auth/register` | POST | User registration | `{username, email, password, app}` | `{token, refreshToken, user}` |
| `/api/auth/profile` | GET | Get user profile | Headers: `Authorization: Bearer <token>` | `{user}` |

### User Management Endpoints

| Endpoint | Method | Description | Headers | Response |
|----------|--------|-------------|---------|----------|
| `/api/users/me` | GET | Get current user | `Authorization: Bearer <token>` | `{user}` |
| `/api/users/profile` | PUT | Update user profile | `Authorization: Bearer <token>` | `{user}` |
| `/api/users` | GET | Get all users | `Authorization: Bearer <token>` | `{users}` |

---

## 🔧 Implementation Examples

### React Integration Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const useBaseGeekAuth = (appName) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (identifier, password) => {
    try {
      const response = await axios.post('https://basegeek.clintgeek.com/api/auth/login', {
        identifier,
        password,
        app: appName // Must be one of: 'basegeek', 'notegeek', 'bujogeek', 'fitnessgeek', 'storygeek'
      });

      const { token, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('geek_token', token);
      localStorage.setItem('geek_refresh_token', refreshToken);

      setUser(user);
      setIsAuthenticated(true);

      // Set up axios interceptor for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('geek_token');
    localStorage.removeItem('geek_refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const validateToken = async () => {
    const token = localStorage.getItem('geek_token');
    if (!token) {
      setLoading(false);
      return false;
    }

    try {
      const response = await axios.post('https://basegeek.clintgeek.com/api/auth/validate', {
        token,
        app: appName
      });

      if (response.data.valid) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }

    setLoading(false);
    return false;
  };

  useEffect(() => {
    validateToken();
  }, []);

  return { user, isAuthenticated, loading, login, logout, validateToken };
};

// Usage in component
const FitnessGeekApp = () => {
  const { user, isAuthenticated, loading, login, logout } = useBaseGeekAuth('bujogeek'); // Using bujogeek for FitnessGeek

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <button onClick={logout}>Logout</button>
      {/* Your app content */}
    </div>
  );
};
```

### Node.js/Express Integration Example

```javascript
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware to validate baseGeek tokens
const validateBaseGeekToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const response = await axios.post('https://basegeek.clintgeek.com/api/auth/validate', {
        token,
        app: 'fitnessgeek' // FitnessGeek app name
      });

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Token validation failed' });
  }
};

// Protected route example
app.get('/api/fitness/profile', validateBaseGeekToken, (req, res) => {
  res.json({
    message: 'Protected fitness data',
    user: req.user
  });
});
```

---

## 🔒 Security Considerations

### 1. Token Management

- **Access Tokens**: Short-lived (1 hour by default)
- **Refresh Tokens**: Longer-lived (7 days by default)
- **App-Specific**: Tokens include app context for security
- **Automatic Refresh**: Implement token refresh logic

### 2. CORS Configuration

baseGeek is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5001` (Backend dev server)
- `https://basegeek.clintgeek.com` (Production)
- `https://notegeek.clintgeek.com` (NoteGeek production)
- `http://192.168.1.17:5173` (Local network)

### 3. Rate Limiting

- Login attempts: 5 per 15 minutes
- API requests: Standard rate limiting applied

---

## 🗄️ Database Schema

### User Collection Structure

```javascript
{
  _id: ObjectId,
  username: String,        // Optional, unique
  email: String,          // Optional, unique, lowercase
  passwordHash: String,   // bcrypt hashed, not returned by default
  profile: Object,        // Flexible profile data
  lastLogin: Date,        // Last login timestamp
  createdAt: Date,        // Account creation date
  updatedAt: Date         // Last update date
}
```

### Database Connection

- **Database**: `userGeek`
- **Collection**: `users`
- **Connection String**: `mongodb://datageek_admin:DataGeek_Admin_2024@192.168.1.17:27018/userGeek?authSource=admin`

---

## 🚀 Deployment Configuration

### Environment Variables

```bash
# Required for baseGeek API
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Database connection
MONGODB_URI=mongodb://datageek_admin:DataGeek_Admin_2024@192.168.1.17:27018/datageek?authSource=admin
USERGEEK_MONGODB_URI=mongodb://datageek_admin:DataGeek_Admin_2024@192.168.1.17:27018/userGeek?authSource=admin

# CORS origins (comma-separated)
ALLOWED_ORIGINS=https://fitnessgeek.clintgeek.com,https://notegeek.clintgeek.com
```

### Docker Deployment

baseGeek runs on:
- **API Port**: 8987
- **UI Port**: 8988
- **MongoDB Port**: 27018
- **Redis Port**: 6380
- **PostgreSQL Port**: 55432

---

## 🔄 Cross-Application Communication

### Event Broadcasting

baseGeek broadcasts authentication state changes:

```javascript
// Listen for auth state changes
window.addEventListener('message', (event) => {
  if (event.data.type === 'GEEK_AUTH_STATE_CHANGE') {
    const { token, refreshToken, user, app } = event.data.payload;
    // Handle auth state change
    console.log('Auth state changed:', { user, app });
  }
});
```

### Shared State Management

Use the shared auth store for consistent state across applications:

```javascript
import useSharedAuthStore from '@basegeek/shared-auth-store';

const {
  token,
  user,
  isAuthenticated,
  login,
  logout,
  checkAuth
} = useSharedAuthStore();
```

---

## 📋 Integration Checklist

- [ ] Configure CORS to allow your app's domain
- [ ] Implement token storage and management
- [ ] Add automatic token refresh logic
- [ ] Set up axios interceptors for API calls
- [ ] Implement logout functionality
- [ ] Add loading states for authentication
- [ ] Test cross-origin authentication
- [ ] Implement error handling for auth failures
- [ ] Add user profile integration
- [ ] Test token validation on protected routes

---

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your domain is in the allowed origins
2. **Token Expiration**: Implement automatic refresh logic
3. **Invalid App**: Use correct app name in login requests
4. **Database Connection**: Verify MongoDB connection string
5. **JWT Secret**: Ensure JWT secrets are properly configured

### Debug Endpoints

- `GET /api/health` - API health check
- `GET /api/mongo/status` - MongoDB connection status
- `GET /api/redis/status` - Redis connection status
- `GET /api/postgres/status` - PostgreSQL connection status

---

## 📚 Additional Resources

- [baseGeek API Documentation](../baseGeek/DOCS/)
- [GeekSuite Design System](./GeekSuite_Unified_Design_System.md)
- [MongoDB Connection Guide](../baseGeek/DOCS/)
- [JWT Token Best Practices](https://jwt.io/introduction)

---

This integration guide provides everything needed to connect your GeekSuite application to the centralized baseGeek user management system. The system is designed to be secure, scalable, and easy to integrate across all GeekSuite applications.