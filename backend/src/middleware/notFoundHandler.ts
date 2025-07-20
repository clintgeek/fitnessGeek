import { Request, Response } from 'express';
import { createError } from './errorHandler';

export const notFoundHandler = (req: Request, res: Response): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);

  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  });
};