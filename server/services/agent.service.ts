import Agent from '../models/Agent.model';
import Sale from '../models/Sale.model';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export class AgentService {
  async getAllAgents() {
    return Agent.find({ isActive: true })
      .select('-__v')
      .sort({ name: 1 })
      .lean();
  }

  async getAgentById(agentId: string) {
    const agent = await Agent.findById(agentId)
      .select('-__v')
      .lean();

    if (!agent) return null;

    return {
      ...agent,
      stats: {
        currentRank: await this.getAgentRank(agentId),
        dailySales: agent.dailySales,
        weeklySales: agent.weeklySales,
        monthlySales: agent.monthlySales,
        totalSales: agent.totalSales,
        averageTicket: agent.averageTicketSize,
        conversionRate: agent.conversionRate,
      },
    };
  }

  async getAgentHistory(
    agentId: string,
    startDate?: string,
    endDate?: string,
    interval = 'day'
  ) {
    const start = startDate ? parseISO(startDate) : startOfDay(new Date());
    const end = endDate ? parseISO(endDate) : endOfDay(new Date());

    const sales = await Sale.find({
      agentId,
      timestamp: { $gte: start, $lte: end },
    })
      .sort({ timestamp: -1 })
      .lean();

    return {
      agentId,
      period: { start, end },
      history: this.aggregateSalesByInterval(sales, interval),
    };
  }

  private async getAgentRank(agentId: string): Promise<number> {
    const agent = await Agent.findById(agentId).lean();
    if (!agent) return 0;

    const higherRanked = await Agent.countDocuments({
      isActive: true,
      dailyRevenue: { $gt: agent.dailyRevenue },
    });

    return higherRanked + 1;
  }

  private aggregateSalesByInterval(sales: any[], interval: string) {
    const aggregated: any = {};

    sales.forEach((sale) => {
      const key = this.getIntervalKey(sale.timestamp, interval);
      if (!aggregated[key]) {
        aggregated[key] = {
          date: key,
          sales: 0,
          revenue: 0,
        };
      }
      aggregated[key].sales += 1;
      aggregated[key].revenue += sale.amount;
    });

    return Object.values(aggregated);
  }

  private getIntervalKey(date: Date, interval: string): string {
    const d = new Date(date);
    if (interval === 'day') {
      return d.toISOString().split('T')[0];
    } else if (interval === 'week') {
      const week = Math.ceil(d.getDate() / 7);
      return `${d.getFullYear()}-W${week}`;
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  }
}