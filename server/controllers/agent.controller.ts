import { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/agent.service';

const agentService = new AgentService();

export const getAllAgents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const agents = await agentService.getAllAgents();
    res.json(agents);
  } catch (error) {
    next(error);
  }
};

export const getAgentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    next(error);
  }
};

export const getAgentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query;
    const history = await agentService.getAgentHistory(
      req.params.id,
      startDate as string,
      endDate as string,
      interval as string
    );
    res.json(history);
  } catch (error) {
    next(error);
  }
};