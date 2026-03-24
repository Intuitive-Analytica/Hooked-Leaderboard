import { Router } from 'express';
import { recordSale, getSalesSummary } from '../controllers/sales.controller';
import { strictRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/record', strictRateLimiter, recordSale);
router.get('/summary', getSalesSummary);

export default router;