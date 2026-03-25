import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!mongoIdPattern.test(id)) {
      logger.warn(`Invalid ObjectId attempt: ${id} from IP ${req.ip}`);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    next();
  };
};

export const validateQuery = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      logger.warn(`Query validation failed: ${error.message} from IP ${req.ip}`);
      return res.status(400).json({ error: error.details[0].message });
    }

    req.query = value;
    next();
  };
};

export const validateBody = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      logger.warn(`Body validation failed: ${error.message} from IP ${req.ip}`);
      return res.status(400).json({ error: error.details[0].message });
    }

    req.body = value;
    next();
  };
};

export const schemas = {
  recordSale: Joi.object({
    agentId: Joi.string().pattern(mongoIdPattern).required(),
    saleAmount: Joi.number().positive().required(),
    productId: Joi.string().optional(),
    customerId: Joi.string().optional(),
    notes: Joi.string().max(500).optional(),
  }),

  dateRange: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('revenue', 'sales', 'name').default('revenue'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};