import { Router } from 'express';
import { recordSale, getSalesSummary } from '../controllers/sales.controller';
import { strictRateLimiter } from '../middleware/rateLimit.middleware';
import { validateBody, schemas } from '../middleware/validation.middleware';
import { criticalAuditLogger } from '../middleware/audit.middleware';

const router = Router();

router.post('/record',
  strictRateLimiter,
  validateBody(schemas.recordSale),
  criticalAuditLogger('record_sale', 'sales'),
  recordSale
);

router.get('/summary', getSalesSummary);

export default router;