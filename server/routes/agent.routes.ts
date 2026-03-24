import { Router } from 'express';
import {
  getAgentById,
  getAgentHistory,
  getAllAgents,
} from '../controllers/agent.controller';

const router = Router();

router.get('/', getAllAgents);
router.get('/:id', getAgentById);
router.get('/:id/history', getAgentHistory);

export default router;