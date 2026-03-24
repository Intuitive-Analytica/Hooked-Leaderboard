import { Router } from 'express';
import {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
} from '../controllers/leaderboard.controller';

const router = Router();

router.get('/daily', getDailyLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

export default router;