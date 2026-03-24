import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await analyticsService.getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trends = await analyticsService.getTrends();
    res.json(trends);
  } catch (error) {
    next(error);
  }
};

export const getRankings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rankings = await analyticsService.getRankings();
    res.json(rankings);
  } catch (error) {
    next(error);
  }
};