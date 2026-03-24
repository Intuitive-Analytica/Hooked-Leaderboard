import { Router } from 'express';
import { getSummary, getTrends, getRankings } from '../controllers/analytics.controller';

const router = Router();

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/rankings', getRankings);

export default router;