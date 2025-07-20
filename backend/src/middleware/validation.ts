import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { createError } from './errorHandler';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = `Validation failed: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
        next(createError(errorMessage, 400));
      } else {
        next(error);
      }
    }
  };
};