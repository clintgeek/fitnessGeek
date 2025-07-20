import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/authSchemas';
import { BaseGeekAuthResponse, BaseGeekProfileResponse, BaseGeekRefreshResponse } from '../types/baseGeek';

const BASEGEEK_URL = process.env.BASEGEEK_URL || 'https://basegeek.clintgeek.com';

/**
 * Login user via baseGeek
 */
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier, password, app } = req.body;

    logger.info(`Login attempt for user: ${identifier}`);

    // Forward login request to baseGeek
    const response = await axios.post<BaseGeekAuthResponse>(`${BASEGEEK_URL}/api/auth/login`, {
      identifier,
      password,
      app: app || 'fitnessgeek'
    });

    const { token, refreshToken, user } = response.data;

    logger.info(`Login successful for user: ${user.username || user.email}`);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          app: user.app
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Login error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      next(createError('Invalid credentials', 401));
    } else if (error.response?.status === 429) {
      next(createError('Too many login attempts', 429));
    } else {
      next(createError('Login failed', 500));
    }
  }
};

/**
 * Register new user via baseGeek
 */
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password, app } = req.body;

    logger.info(`Registration attempt for user: ${username || email}`);

    // Forward registration request to baseGeek
    const response = await axios.post<BaseGeekAuthResponse>(`${BASEGEEK_URL}/api/auth/register`, {
      username,
      email,
      password,
      app: app || 'fitnessgeek'
    });

    const { token, refreshToken, user } = response.data;

    logger.info(`Registration successful for user: ${user.username || user.email}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          app: user.app
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Registration error:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 'Registration failed';
      next(createError(errorMessage, 400));
    } else {
      next(createError('Registration failed', 500));
    }
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    // Get user profile from baseGeek
    const response = await axios.get<BaseGeekProfileResponse>(`${BASEGEEK_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
      }
    });

    res.json({
      success: true,
      data: {
        user: response.data.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Get current user error:', error.response?.data || error.message);
    next(createError('Failed to get user profile', 500));
  }
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (
  req: Request<{}, {}, RefreshTokenRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken, app } = req.body;

    logger.info('Token refresh attempt');

    // Forward refresh request to baseGeek
    const response = await axios.post<BaseGeekRefreshResponse>(`${BASEGEEK_URL}/api/auth/refresh`, {
      refreshToken,
      app: app || 'fitnessgeek'
    });

    const { token, newRefreshToken, user } = response.data;

    logger.info('Token refresh successful');

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          app: user.app
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      next(createError('Invalid refresh token', 401));
    } else {
      next(createError('Token refresh failed', 500));
    }
  }
};