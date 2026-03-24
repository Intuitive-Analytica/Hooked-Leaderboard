import { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';

const leaderboardService = new LeaderboardService();

export const getDailyLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await leaderboardService.getDailyLeaderboard();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getWeeklyLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await leaderboardService.getWeeklyLeaderboard();
    res.json(data);
  } catch (error) {
    next(error);
  }
};