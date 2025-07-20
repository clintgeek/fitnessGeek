import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { logger } from '../config/logger';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    app: string;
  };
}

const BASEGEEK_URL = process.env.BASEGEEK_URL || 'https://basegeek.clintgeek.com';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Authentication token required', 401);
    }

    // Validate token with baseGeek
    try {
      const response = await axios.post(`${BASEGEEK_URL}/api/auth/validate`, {
        token,
        app: 'fitnessgeek'
      });

      if (response.data.valid) {
        req.user = response.data.user;
        next();
      } else {
        throw createError('Invalid token', 401);
      }
    } catch (error) {
      logger.error('Token validation error:', error);
      throw createError('Token validation failed', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Validate token with baseGeek
    try {
      const response = await axios.post(`${BASEGEEK_URL}/api/auth/validate`, {
        token,
        app: 'fitnessgeek'
      });

      if (response.data.valid) {
        req.user = response.data.user;
      }
    } catch (error) {
      logger.warn('Optional auth failed:', error);
    }

    next();
  } catch (error) {
    next();
  }
};