import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../utils/logger';

const createRateLimiter = (name: string, windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    keyGenerator: (req: Request) => {
      return req.ip || 'unknown';
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP ${req.ip} on ${name}`);
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(windowMs / 1000)
      });
    },
    skip: (req: Request) => {
      if (process.env.NODE_ENV === 'test') {
        return true;
      }
      return false;
    }
  });
};

export const globalRateLimiter = createRateLimiter('global', 15 * 60 * 1000, 100);

export const apiRateLimiter = createRateLimiter('api', 1 * 60 * 1000, 60);

export const authRateLimiter = createRateLimiter('auth', 15 * 60 * 1000, 5);

export const strictRateLimiter = createRateLimiter('strict', 1 * 60 * 1000, 10);

export const salesRateLimiter = createRateLimiter('sales', 1 * 60 * 1000, 30);

export const rateLimiter = apiRateLimiter;