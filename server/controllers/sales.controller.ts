import { Request, Response, NextFunction } from 'express';
import { SalesService } from '../services/sales.service';

const salesService = new SalesService();

export const recordSale = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await salesService.recordSale(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSalesSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'today' } = req.query;
    const summary = await salesService.getSalesSummary(period as string);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};